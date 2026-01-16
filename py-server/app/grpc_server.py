"""
gRPC Server for YouTube Metadata Generator
Runs alongside FastAPI for gRPC-based communication
"""

import grpc
from concurrent import futures
import asyncio
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import generated protobuf classes
from app.generated import metadata_pb2
from app.generated import metadata_pb2_grpc

# Import the generator from index.py
from app.index import generator, MODEL_NAME, device, load_model, USE_AI


class MetadataServiceServicer(metadata_pb2_grpc.MetadataServiceServicer):
    """gRPC service implementation for metadata generation"""

    async def GenerateMetadata(self, request, context):
        """Generate all metadata at once"""
        try:
            audience = request.target_audience or "beginners"
            use_ai = request.use_ai if request.HasField('use_ai') else True
            keywords = list(request.keywords) if request.keywords else None

            titles, t_src = await generator.generate_titles(
                request.video_topic, audience, keywords, use_ai
            )
            description, d_src = await generator.generate_description(
                request.video_topic, request.video_description or None, 
                audience, keywords, use_ai
            )
            hashtags, h_src = await generator.generate_hashtags(
                request.video_topic, audience, keywords, use_ai
            )
            tags, tag_src = await generator.generate_tags(
                request.video_topic, audience, keywords, use_ai
            )

            generated_by = "ai" if "ai" in [t_src, d_src, h_src, tag_src] else "template"

            return metadata_pb2.MetadataResponse(
                titles=titles,
                description=description,
                hashtags=hashtags,
                tags=tags,
                generated_by=generated_by
            )
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return metadata_pb2.MetadataResponse()

    async def GenerateTitles(self, request, context):
        """Generate only titles"""
        try:
            audience = request.target_audience or "beginners"
            use_ai = request.use_ai if request.HasField('use_ai') else True
            keywords = list(request.keywords) if request.keywords else None

            titles, source = await generator.generate_titles(
                request.video_topic, audience, keywords, use_ai
            )

            return metadata_pb2.TitlesResponse(
                titles=titles,
                generated_by=source
            )
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return metadata_pb2.TitlesResponse()

    async def GenerateDescription(self, request, context):
        """Generate only description"""
        try:
            audience = request.target_audience or "beginners"
            use_ai = request.use_ai if request.HasField('use_ai') else True
            keywords = list(request.keywords) if request.keywords else None

            description, source = await generator.generate_description(
                request.video_topic, request.video_description or None,
                audience, keywords, use_ai
            )

            return metadata_pb2.DescriptionResponse(
                description=description,
                generated_by=source
            )
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return metadata_pb2.DescriptionResponse()

    async def GenerateHashtags(self, request, context):
        """Generate only hashtags"""
        try:
            audience = request.target_audience or "beginners"
            use_ai = request.use_ai if request.HasField('use_ai') else True
            keywords = list(request.keywords) if request.keywords else None

            hashtags, source = await generator.generate_hashtags(
                request.video_topic, audience, keywords, use_ai
            )

            return metadata_pb2.HashtagsResponse(
                hashtags=hashtags,
                generated_by=source
            )
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return metadata_pb2.HashtagsResponse()

    async def GenerateTags(self, request, context):
        """Generate only tags"""
        try:
            audience = request.target_audience or "beginners"
            use_ai = request.use_ai if request.HasField('use_ai') else True
            keywords = list(request.keywords) if request.keywords else None

            tags, source = await generator.generate_tags(
                request.video_topic, audience, keywords, use_ai
            )

            return metadata_pb2.TagsResponse(
                tags=tags,
                total_characters=sum(len(t) for t in tags) + len(tags),
                generated_by=source
            )
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return metadata_pb2.TagsResponse()

    async def GenerateDynamic(self, request, context):
        """Dynamic generation based on requested fields"""
        try:
            audience = request.target_audience or "beginners"
            use_ai = request.use_ai if request.HasField('use_ai') else True
            keywords = list(request.keywords) if request.keywords else None
            fields = [f.lower() for f in request.fields]

            response = metadata_pb2.DynamicResponse()
            sources = []

            if "title" in fields or "titles" in fields:
                titles, src = await generator.generate_titles(
                    request.video_topic, audience, keywords, use_ai
                )
                sources.append(src)
                if "title" in fields and titles:
                    response.title = titles[0]
                if "titles" in fields:
                    response.titles.extend(titles)

            if "description" in fields:
                desc, src = await generator.generate_description(
                    request.video_topic, request.video_description or None,
                    audience, keywords, use_ai
                )
                sources.append(src)
                response.description = desc

            if "hashtags" in fields:
                hashtags, src = await generator.generate_hashtags(
                    request.video_topic, audience, keywords, use_ai
                )
                sources.append(src)
                response.hashtags.extend(hashtags)

            if "tags" in fields:
                tags, src = await generator.generate_tags(
                    request.video_topic, audience, keywords, use_ai
                )
                sources.append(src)
                response.tags.extend(tags)

            response.generated_by = "ai" if "ai" in sources else "template"
            return response

        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return metadata_pb2.DynamicResponse()

    async def HealthCheck(self, request, context):
        """Health check endpoint"""
        return metadata_pb2.HealthResponse(
            status="healthy",
            version="4.0.0",
            ai_loaded=generator.check_ai(),
            model=MODEL_NAME,
            device=device
        )


async def serve(port: int = 50051):
    """Start the gRPC server"""
    # Load the model if AI is enabled
    if USE_AI:
        load_model()

    server = grpc.aio.server(futures.ThreadPoolExecutor(max_workers=10))
    metadata_pb2_grpc.add_MetadataServiceServicer_to_server(
        MetadataServiceServicer(), server
    )
    
    listen_addr = f'[::]:{port}'
    server.add_insecure_port(listen_addr)
    
    print(f"🚀 gRPC Server starting on port {port}")
    print(f"📍 Listening on {listen_addr}")
    
    await server.start()
    print("✅ gRPC Server started successfully!")
    
    try:
        await server.wait_for_termination()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down gRPC server...")
        await server.stop(5)


if __name__ == "__main__":
    port = int(os.getenv("GRPC_PORT", "50051"))
    asyncio.run(serve(port))

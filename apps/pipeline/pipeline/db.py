from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
import datetime

Base = declarative_base()

class Episode(Base):
    __tablename__ = "episodes"
    id = Column(Integer, primary_key=True)
    source_path = Column(String)
    title = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Clip(Base):
    __tablename__ = "clips"
    id = Column(Integer, primary_key=True)
    episode_id = Column(Integer)
    start_sec = Column(Float)
    end_sec = Column(Float)
    score = Column(Float)
    reason = Column(String)
    video_path = Column(String)
    thumbnail_path = Column(String)
    gen_title = Column(String)
    gen_description = Column(String)
    gen_hashtags = Column(String)
    status = Column(String, default="pending_review")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

engine = create_engine("sqlite:///data/pipeline.db")
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

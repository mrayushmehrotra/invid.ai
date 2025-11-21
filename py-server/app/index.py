import moviepy.editor as mp
import pysrt
import tkinter as tk
from tkinter import filedialog
import os
from moviepy.config import change_settings

change_settings({"IMAGEMAGICK_BINARY": r"/usr/local/bin/magick"})

# print(mp.TextClip.list("font"))


def srt_to_moviepy_subtitles(srt_file, video_clip):
    subs = pysrt.open(srt_file)
    subtitle_clips = []

    for sub in subs:
        start_time = sub.start.to_time()
        end_time = sub.end.to_time()
        start_seconds = (
            start_time.hour * 3600
            + start_time.minute * 60
            + start_time.second
            + start_time.microsecond / 1e6
        )
        end_seconds = (
            end_time.hour * 3600
            + end_time.minute * 60
            + end_time.second
            + end_time.microsecond / 1e6
        )
        duration = end_seconds - start_seconds

        # Format the text to handle newlines properly
        formatted_text = sub.text.replace("\n", " ")

        # Create a text clip with yellow monospace text on a transparent background
        text_clip = (
            mp.TextClip(
                formatted_text,
                fontsize=30,  # Small font size
                color="white",  # Yellow text color
                font="Ubuntu-Sans-Mono-SemiBold",  # Monospace font
                stroke_color="black",  # Black outline for better contrast
                stroke_width=4,
                method="caption",
                size=(video_clip.w - 40, None),  # Padding for readability
            )
            .set_start(start_seconds)
            .set_duration(duration)
            .set_position(
                ("center", "center")
            )  # video_clip.h - 50 => ||   # Positioned near bottom
        )

        # Add the text clip to the list of subtitle clips
        subtitle_clips.append(text_clip)

    return mp.CompositeVideoClip([video_clip] + subtitle_clips)


def burn_subtitles(video_file, srt_file, output_file):
    video_clip = mp.VideoFileClip(video_file)
    video_with_subs = srt_to_moviepy_subtitles(srt_file, video_clip)
    video_with_subs.write_videofile(output_file, codec="libx264", audio_codec="aac")


def select_files():
    # Initialize Tkinter and hide the root window
    root = tk.Tk()
    root.withdraw()

    # Prompt user to select video and subtitle files
    video_file_path = filedialog.askopenfilename(
        title="Select Video File", filetypes=[("Video Files", "*.mp4")]
    )
    srt_file_path = filedialog.askopenfilename(
        title="Select Subtitle File", filetypes=[("Subtitle Files", "*.srt")]
    )

    if not video_file_path or not srt_file_path:
        raise ValueError(
            "Please select both a .mp4 video file and a .srt subtitle file."
        )

    return video_file_path, srt_file_path


# Main execution
video_file_path, srt_file_path = select_files()
output_file_name = "output.mp4"
burn_subtitles(video_file_path, srt_file_path, output_file_name)

# Confirm output file creation
if os.path.exists(output_file_name):
    print(f"Output file created: {output_file_name}")
else:
    print("Failed to create output file.")

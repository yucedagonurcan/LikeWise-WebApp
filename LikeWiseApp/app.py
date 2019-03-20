import os

import pandas as pd
from flask import Flask, jsonify, request

import LikeWise.configs as configs
from LikeWise import main
import json
import shutil
import cv2
import numpy as np
import base64
from PIL import Image
from io import BytesIO
import re
import time
import base64

app = Flask(__name__)
model = main.create_model(configs)


def getI420FromBase64(codec, image_path="c:\\"):
    base64_data = re.sub('^data:image/.+;base64,', '', codec)
    byte_data = base64.b64decode(base64_data)
    image_data = BytesIO(byte_data)
    img = Image.open(image_data)
    img.save(image_path)


@app.route("/predict_images", methods=["POST"])
def predict_images():

    files = request.get_json()
    for file in files:
        getI420FromBase64(file["base64"], os.path.join(
            configs.test_img_path, file["filename"]))
        print(f"File saved {file['filename']}")

    img_serie = pd.Series([file["filename"] for file in files])

    scores = main.predict_images(
        model=model, image_series=img_serie, configs=configs)
    return jsonify(scores)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

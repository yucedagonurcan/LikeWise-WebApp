# -*- coding: utf-8 -*-
import json
import os

import numpy as np
import torch
import torchvision.models as models
import torchvision.transforms as transforms

from LikeWise.data_loader import LikeWise
from LikeWise.model import NIMA, emd_loss, single_emd_loss
import LikeWise.configs as configs
from flask import jsonify


def create_model(configs):

    base_model = models.vgg16(pretrained=True)
    model = NIMA(base_model)

    if configs.warm_start and os.path.exists(os.path.join(
            configs.ckpt_path, 'epoch-%d.pkl' % configs.warm_start_epoch)):
        model.load_state_dict(torch.load(os.path.join(
            configs.ckpt_path, 'epoch-%d.pkl' % configs.warm_start_epoch), map_location=configs.device))
        print('Successfully loaded model epoch-%d.pkl' %
              configs.warm_start_epoch)

    model = model.to(configs.device)
    return model


def predict_images(model, image_series, configs):
    model.eval()

    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.RandomCrop(224),
        transforms.ToTensor()])

    testset = LikeWise(
        image_series=image_series, root_dir=configs.test_img_path, transform=val_transform)
    test_loader = torch.utils.data.DataLoader(
        testset, batch_size=configs.test_batch_size, shuffle=False, num_workers=configs.num_workers)

    mean_preds = []
    std_preds = []
    for data in test_loader:
        image = data['image'].to(configs.device)
        output = model(image)
        output = output.view(10, 1)
        predicted_mean, predicted_std = 0.0, 0.0
        for i, elem in enumerate(output, 1):
            predicted_mean += i * elem
        for j, elem in enumerate(output, 1):
            predicted_std += elem * (j - predicted_mean) ** 2
        mean_preds.append(predicted_mean)
        std_preds.append(predicted_std)
    return {"Images": [image for image in image_series.values],
            "Mean Scores": [pred_mean.item() for pred_mean in mean_preds],
            "Std Scores": [pred_std.item() for pred_std in std_preds]}

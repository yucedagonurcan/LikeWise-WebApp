# -*- coding: utf-8

import os

import pandas as pd
from PIL import Image

import torch
from torch.utils import data


class LikeWise(data.Dataset):
    """AVA dataset

    Args:
        image_series: Pandas Series Object which contains image file names.
        root_dir: directory to the images
        transform: preprocessing and augmentation of the training images
    """

    def __init__(self, image_series, root_dir, transform=None):
        self.annotations = image_series
        self.root_dir = root_dir
        self.transform = transform

    def __len__(self):
        return len(self.annotations)

    def __getitem__(self, idx):
        img_name = os.path.join(self.root_dir, str(
            self.annotations.iloc[idx]))
        image = Image.open(img_name)
        sample = {'img_id': img_name, 'image': image}

        if self.transform:
            sample['image'] = self.transform(sample['image'])

        return sample

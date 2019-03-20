import torch
import pandas as pd

test_img_path = "LikeWise/test_images"
test = True
test_batch_size = 1
num_workers = 4
ckpt_path = "LikeWise/models"
warm_start = True
warm_start_epoch = 12
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# model_loader.py
import joblib
import lightgbm as lgb
from tensorflow import keras

LGB_PATH = "models/03 dec 2025 lgb_eth.txt"
TCN_PATH = "models/03 dec 2025 tcn_eth.h5"
META_PATH = "models/03 dec 2025 meta_stack_eth.pkl"

def load_models():
    model_lgb = lgb.Booster(model_file=LGB_PATH)
    model_tcn = keras.models.load_model(TCN_PATH, compile=False)
    meta_model = joblib.load(META_PATH)
    return model_lgb, model_tcn, meta_model

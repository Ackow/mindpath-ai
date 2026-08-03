"""
01-environment.py - Python 基础与环境检测示例
"""

import sys

def check_environment():
    print(f"当前 Python 版本: {sys.version}")
    
    try:
        import numpy as np
        print(f"✅ NumPy 已正常加载, 版本: {np.__version__}")
    except ImportError:
        print("❌ 未未找到 NumPy 库，请使用 pip install numpy 安装")

if __name__ == "__main__":
    check_environment()

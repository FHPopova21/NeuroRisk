import json
import os

NOTEBOOK_PATH = 'notebooks/10_EDA_Part3.ipynb'

def create_notebook():
    cells = []

    # 1. Title and Setup
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "# EDA III: Статистически анализ на суровите данни\n",
            "\n",
            "## 1. Подготовка (Setup)\n",
            "Зареждане на библиотеките и данните."
        ]
    })

    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "import numpy as np\n",
            "import matplotlib.pyplot as plt\n",
            "import seaborn as sns\n",
            "import os\n",
            "import sys\n",
            "\n",
            "# Add src to path\n",
            "sys.path.append(os.path.abspath('..'))\n",
            "from src.data_processing.loader import load_bonn_data\n",
            "\n",
            "sns.set_style('whitegrid')\n",
            "plt.rcParams['figure.figsize'] = (10, 6)\n",
            "\n",
            "# Load Raw Data\n",
            "DATA_PATH = '../data/raw'\n",
            "if not os.path.exists(DATA_PATH):\n",
            "    DATA_PATH = 'data/raw'\n",
            "\n",
            "print(f\"Loading data from {DATA_PATH}...\")\n",
            "try:\n",
            "    X, y = load_bonn_data(DATA_PATH)\n",
            "    print(f\"Loaded X shape: {X.shape}, y shape: {y.shape}\")\n",
            "except Exception as e:\n",
            "    print(f\"Error loading data: {e}\")\n",
            "    # Fallback for empty/missing data in test env\n",
            "    X = np.random.randn(500, 4097)\n",
            "    y = np.array([0]*200 + [1]*200 + [2]*100)\n",
            "    print(\"Using dummy data for visualization structure.\")"
        ]
    })

    # 2. 3-Sigma Analysis
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 2. Анализ на нестабилност (3-Sigma Rule)\n",
            "Ще изчислим какъв процент от точките във всеки сигнал излизат извън диапазона $\\mu \\pm 3\\sigma$. Това е индикатор за наличието на екстремни събития (като спайкове при пристъпи)."
        ]
    })

    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "def calculate_outliers_percentage(signal):\n",
            "    mu = np.mean(signal)\n",
            "    sigma = np.std(signal)\n",
            "    \n",
            "    lower_bound = mu - 3 * sigma\n",
            "    upper_bound = mu + 3 * sigma\n",
            "    \n",
            "    outliers = np.sum((signal < lower_bound) | (signal > upper_bound))\n",
            "    return (outliers / len(signal)) * 100\n",
            "\n",
            "# Calculate for all samples\n",
            "outlier_percentages = np.array([calculate_outliers_percentage(x) for x in X])\n",
            "\n",
            "# Group by class\n",
            "class_names = {0: 'Healthy', 1: 'Inter-ictal', 2: 'Seizure'}\n",
            "\n",
            "plt.figure(figsize=(10, 6))\n",
            "sns.boxplot(x=[class_names[c] for c in y], y=outlier_percentages, palette='viridis', order=['Healthy', 'Inter-ictal', 'Seizure'])\n",
            "plt.title('Percentage of Data Points Outside 3-Sigma')\n",
            "plt.ylabel('Outliers (%)')\n",
            "plt.xlabel('Class')\n",
            "plt.show()\n",
            "\n",
            "# Print stats\n",
            "for c in [0, 1, 2]:\n",
            "    class_outliers = outlier_percentages[y == c]\n",
            "    print(f\"Class {class_names[c]}: Mean Outlier % = {np.mean(class_outliers):.2f}%\")"
        ]
    })

    # 3. Class Imbalance
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 3. Класов баланс (Class Imbalance)\n",
            "Визуализация на разпределението на класовете и изчисляване на Imbalance Ratio."
        ]
    })

    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [
            "unique, counts = np.unique(y, return_counts=True)\n",
            "class_counts = dict(zip(unique, counts))\n",
            "\n",
            "# Prepare data for Pie Chart\n",
            "labels = [class_names[u] for u in unique]\n",
            "sizes = counts\n",
            "colors = sns.color_palette('viridis', len(unique))\n",
            "\n",
            "plt.figure(figsize=(8, 8))\n",
            "plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140, colors=colors, textprops={'fontsize': 12})\n",
            "plt.title('Class Distribution')\n",
            "plt.show()\n",
            "\n",
            "# Calculate Imbalance Ratio\n",
            "total_samples = len(y)\n",
            "seizure_count = class_counts.get(2, 0)\n",
            "imbalance_ratio = seizure_count / total_samples\n",
            "\n",
            "print(f\"Total Samples: {total_samples}\")\n",
            "print(f\"Seizure Samples: {seizure_count}\")\n",
            "print(f\"Imbalance Ratio (Seizure / Total): {imbalance_ratio:.4f}\")\n",
            "print(f\"Inverse Ratio (Total / Seizure): {1/imbalance_ratio:.2f}\")"
        ]
    })

    # Notebook structure
    notebook = {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "codemirror_mode": {
                    "name": "ipython",
                    "version": 3
                },
                "file_extension": ".py",
                "mimetype": "text/x-python",
                "name": "python",
                "nbconvert_exporter": "python",
                "pygments_lexer": "ipython3",
                "version": "3.8.10"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }

    # Write notebook file
    os.makedirs(os.path.dirname(NOTEBOOK_PATH), exist_ok=True)
    with open(NOTEBOOK_PATH, 'w', encoding='utf-8') as f:
        json.dump(notebook, f, indent=4, ensure_ascii=False)
    
    print(f"Notebook successfully created at: {NOTEBOOK_PATH}")

if __name__ == "__main__":
    create_notebook()

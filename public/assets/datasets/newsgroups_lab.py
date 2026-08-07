# Kaggle 20 新闻组多分类朴素贝叶斯实验脚本 (newsgroups_lab.py)
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# 1. 读取 20 新闻组样例文本数据集
df = pd.read_csv('newsgroups_sample.csv')

X_raw = df['text']
y = df['target']

# 2. 划分训练集与测试集
X_train_raw, X_test_raw, y_train, y_test = train_test_split(
    X_raw, y, test_size=0.2, random_state=42, stratify=y
)

# 3. 文本特征提取: 使用 TF-IDF 向量化器
tfidf = TfidfVectorizer(stop_words='english', max_features=5000)
X_train_tfidf = tfidf.fit_transform(X_train_raw)
X_test_tfidf = tfidf.transform(X_test_raw)

# 4. 构建并训练多项式朴素贝叶斯模型 (MultinomialNB)
nb = MultinomialNB(alpha=1.0)
nb.fit(X_train_tfidf, y_train)

# 5. 测试集评估
y_pred = nb.predict(X_test_tfidf)
acc = accuracy_score(y_test, y_pred)

print("== 20 新闻组文本分类朴素贝叶斯实验 (20 Newsgroups Lab) ==")
print(f"训练集文本数: {len(X_train_raw)} | 测试集文本数: {len(X_test_raw)}")
print(f"TF-IDF 词汇表大小: {X_train_tfidf.shape[1]}")
print(f"测试集准确率 Accuracy: {acc * 100:.2f}%")
print("
分类性能报告 (Classification Report):")
print(classification_report(y_test, y_pred))

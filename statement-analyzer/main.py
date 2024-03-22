import pandas as pd
import os

CATEGORIES = [
    {"name": "Spendz Account", "keywords": ['SENT TO SPENDZ']},
    {"name": "Accomptant Salary", "keywords": [
        "KCH AND", "IMPS TRANSACTION 230303 306204581173", "Wise"]},
    {"name": "PO-RD", "keywords": ["PO RD"]},
    {"name": "Milk", "keywords": ["BABURAO RAMCHAN"]},
    {"name": "House Construction", "keywords": [
        "First Installement", "House", "Construction", "Building", "Tata Lpp", "Loan Return", "Test", "Cash Withdrawal by self", "Shree Trad"]},
    {"name": "Advance Tax", "keywords": ["ETAX"]},
    {"name": "Amazon Shopping", "keywords": ["Tushar, amazon_sellet"]},
    {"name": "Cash Withdrawal", "keywords": ["ATW"]},
    {"name": "Netflix", "keywords": ["Netflix"]},
    {"name": "Ignis Maintenance", "keywords": ['Ignis', 'petrol']},
    {"name": "Cognizant Salary", "keywords": ["Cognizant Industrial"]},
    {"name": "LIC Investements", "keywords": ["Life Insurance"]},
    {"name": "Mobile Recharge", "keywords": ['EURONETGPAY']},
    {"name": "Simpl", "keywords": ["Simpl"]},
    {"name": "ChatGpt", "keywords": ['ChatGPT']},
    {"name": "Electric House Expense", "keywords": ["Amrutraj"]},
    {"name": "Bangalore PG Rent", "keywords": ["StanzaLiving"]},
    {"name": "Mobile Expenses", "keywords": ["Jio", "Airtel"]},
    {"name": "SBI Life Insurance", "keywords": [
        "PCD/2640/SBILIFEINS/MUMBAI150523/21:02"]}

]

file_path = 'JSD_KMB 2023-24.csv'
df = pd.read_csv(file_path, thousands=',', dayfirst=True,
                 parse_dates=['Transaction Date'])

df['Transaction Date'] = pd.to_datetime(
    df['Transaction Date'], errors='coerce', dayfirst=True)

# Check for any NaT values which indicate parsing issues
if df['Transaction Date'].isnull().any():
    print("Warning: Some dates couldn't be parsed and will be excluded from analysis.")


def categorize_transaction(description):
    description = str(description).lower()
    for category in CATEGORIES:
        if any(keyword.lower() in description for keyword in category['keywords']):
            return category['name']
    return 'Other'


# Categorize transactions
df['Category'] = df['Description'].apply(categorize_transaction)

df['Debit'] = pd.to_numeric(df['Debit'], errors='coerce').fillna(0)
df['Credit'] = pd.to_numeric(df['Credit'], errors='coerce').fillna(0)
df['Amount'] = df['Credit'] - df['Debit']

df['YearMonth'] = df['Transaction Date'].dt.to_period('M')

monthly_stats = df.groupby(['YearMonth', 'Category'])[
    'Amount'].sum().reset_index()


pivot_table = monthly_stats.pivot(
    index='YearMonth', columns='Category', values='Amount').fillna(0)

# print(pivot_table)
pivot_table.to_csv("yearly_report.csv")

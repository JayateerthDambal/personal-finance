import gspread
from oauth2client.service_account import ServiceAccountCredentials
import pandas as pd

# Load your CSV data
data_frame = pd.read_csv("yearly_report.csv")
data_to_upload = [data_frame.columns.tolist()] + data_frame.values.tolist()
# print(data_to_upload)

service_account_file = 'service_account.json'
scope = ['https://spreadsheets.google.com/feeds',
         'https://www.googleapis.com/auth/drive']

credentials = ServiceAccountCredentials.from_json_keyfile_name(
    service_account_file, scope)
gc = gspread.authorize(credentials)

spreadsheet_id = '1CfllKvxWpGKMInOxtNv7IXi90WULVIz7ZMqPWt57g_o'
spreadsheet = gc.open_by_key(spreadsheet_id)
worksheet = spreadsheet.get_worksheet(0)

start_row = 5
end_row = start_row + len(data_to_upload) - 1

range_to_update = f"A{start_row}:Z{end_row}"

worksheet.update(range_name=range_to_update, values=data_to_upload)

print(f"Data has been Updated")


# https://docs.google.com/spreadsheets/d/1CfllKvxWpGKMInOxtNv7IXi90WULVIz7ZMqPWt57g_o/edit#gid=0

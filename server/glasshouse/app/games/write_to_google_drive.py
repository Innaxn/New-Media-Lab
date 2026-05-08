import os
from pathlib import Path
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

def upload_to_drive(local_path: str):
    """
    Overwrites a specific Google Drive file with local JSON data.
    """

    SCOPES = ['https://www.googleapis.com/auth/drive']
    file_id = os.getenv('FILE_ID', "ENV FAILED")
    credentials_path = Path(os.getenv('CREDENTIAL_PATH'))

    if not os.path.exists(credentials_path):
        raise FileNotFoundError(f"Credentials file not found at {credentials_path}")

    creds = service_account.Credentials.from_service_account_file(
        credentials_path, scopes=SCOPES)
    
    service = build('drive', 'v3', credentials=creds)

    media = MediaFileUpload(
        local_path, 
        mimetype='application/json', 
        resumable=True
    )

    try:
        updated_file = service.files().update(
            fileId=file_id,
            media_body=media
        ).execute()
        
        print(f"Drive Sync Complete: Updated file ID {updated_file.get('id')}")
        return True
        
    except Exception as e:
        print(f"Drive Sync Failed\n: {e}")
        return False
"""
Google Drive Folder Structure Creator
Creates a complete document management system folder structure in Google Drive
"""

import os
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Google Drive API scope - allows creating and managing folders
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# Color codes for folders in Google Drive
COLORS = {
    'red': 'folder_color_1',
    'orange': 'folder_color_2',
    'yellow': 'folder_color_3',
    'green': 'folder_color_4',
    'blue': 'folder_color_5',
    'purple': 'folder_color_6'
}

def authenticate_google_drive():
    """
    Authenticate with Google Drive API
    Returns the Drive service object
    """
    creds = None

    # Check if we have saved credentials
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)

    # If no valid credentials, let user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)

        # Save credentials for future use
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    service = build('drive', 'v3', credentials=creds)
    return service

def create_folder(service, folder_name, parent_id=None, color=None):
    """
    Create a folder in Google Drive

    Args:
        service: Google Drive service object
        folder_name: Name of the folder to create
        parent_id: ID of parent folder (None for root)
        color: Color for the folder (optional)

    Returns:
        Folder ID of created folder
    """
    file_metadata = {
        'name': folder_name,
        'mimeType': 'application/vnd.google-apps.folder'
    }

    if parent_id:
        file_metadata['parents'] = [parent_id]

    if color and color in COLORS:
        file_metadata['folderColorRgb'] = COLORS[color]

    try:
        folder = service.files().create(
            body=file_metadata,
            fields='id, name'
        ).execute()

        print(f'✓ Created: {folder_name}')
        return folder.get('id')

    except HttpError as error:
        print(f'✗ Error creating {folder_name}: {error}')
        return None

def create_folder_structure(service, company_name="Your Company"):
    """
    Create the complete folder structure in Google Drive
    """
    print(f"\n🚀 Creating Document Management Structure for '{company_name}'...\n")

    # Create root folder
    root_name = f"{company_name} - Document Hub"
    root_id = create_folder(service, root_name, color='blue')

    if not root_id:
        print("❌ Failed to create root folder. Exiting.")
        return None

    print(f"\n📁 Main Folders:\n")

    # Define the complete folder structure
    structure = {
        '01 - AI Processes': {
            'subfolders': [
                'Prompts & Templates',
                'Workflows',
                'Training Data',
                'Use Cases',
                'Documentation'
            ]
        },
        '02 - Business Processes': {
            'subfolders': {
                'Operations': [
                    'Standard Operating Procedures (SOPs)',
                    'Workflows',
                    'Checklists'
                ],
                'Sales & Marketing': [
                    'Sales Processes',
                    'Marketing Campaigns',
                    'Customer Journey'
                ],
                'Finance & Accounting': [
                    'Invoicing Processes',
                    'Expense Management',
                    'Financial Procedures'
                ],
                'HR & People': [
                    'Onboarding',
                    'Performance Reviews',
                    'Policies'
                ],
                'Product & Development': [
                    'Product Roadmap',
                    'Development Processes',
                    'Quality Assurance'
                ]
            }
        },
        '03 - Business Assets': {
            'subfolders': {
                'Brand Assets': [
                    'Logos',
                    'Brand Guidelines',
                    'Color Palettes',
                    'Fonts'
                ],
                'Marketing Materials': [
                    'Presentations',
                    'Brochures',
                    'Case Studies',
                    'Testimonials'
                ],
                'Templates': [
                    'Document Templates',
                    'Email Templates',
                    'Proposal Templates',
                    'Contract Templates'
                ],
                'Media Library': [
                    'Images',
                    'Videos',
                    'Audio',
                    'Stock Assets'
                ],
                'Legal & Contracts': [
                    'Contracts',
                    'Agreements',
                    'Licenses'
                ]
            }
        },
        '04 - Knowledge Base': {
            'subfolders': [
                'Product Documentation',
                'Technical Guides',
                'FAQs',
                'Training Materials',
                'Best Practices',
                'Case Studies & Learnings'
            ]
        },
        '05 - Important Information': {
            'subfolders': {
                'Company Information': [
                    'Mission & Vision',
                    'Company Policies',
                    'Organizational Charts'
                ],
                'Strategic Planning': [
                    'Business Plans',
                    'OKRs & Goals',
                    'Quarterly Reviews'
                ],
                'Meeting Notes': [
                    'Executive Meetings',
                    'Team Meetings',
                    'Client Meetings'
                ],
                'Research & Insights': [
                    'Market Research',
                    'Competitor Analysis',
                    'Industry Reports'
                ],
                'Emergency & Critical Info': [
                    'Contact Lists',
                    'Passwords & Access (encrypted)',
                    'Disaster Recovery'
                ]
            }
        },
        '06 - Archive': {
            'subfolders': [
                'Archived Projects',
                'Archived Processes',
                '2024 Archives',
                '2025 Archives'
            ]
        }
    }

    # Create the folder structure
    for main_folder, content in structure.items():
        # Create main folder
        main_id = create_folder(service, main_folder, root_id)

        if not main_id:
            continue

        # Process subfolders
        subfolders = content.get('subfolders', [])

        if isinstance(subfolders, list):
            # Simple list of subfolders
            for subfolder in subfolders:
                create_folder(service, subfolder, main_id)

        elif isinstance(subfolders, dict):
            # Nested structure with sub-subfolders
            for subfolder, sub_subfolders in subfolders.items():
                subfolder_id = create_folder(service, subfolder, main_id)

                if subfolder_id and isinstance(sub_subfolders, list):
                    for sub_subfolder in sub_subfolders:
                        create_folder(service, sub_subfolder, subfolder_id)

    print(f"\n✅ Complete! Folder structure created successfully!")
    print(f"\n📂 Find your new structure in Google Drive:")
    print(f"   Search for: '{root_name}'")
    print(f"\n🔗 Or visit: https://drive.google.com/drive/folders/{root_id}")

    return root_id

def main():
    """Main function to run the script"""
    print("=" * 60)
    print("Google Drive Document Management Structure Creator")
    print("=" * 60)

    # Get company name from user
    company_name = input("\nEnter your company name (or press Enter for 'Your Company'): ").strip()
    if not company_name:
        company_name = "Your Company"

    try:
        # Authenticate
        print("\n🔐 Authenticating with Google Drive...")
        service = authenticate_google_drive()
        print("✓ Authentication successful!")

        # Create structure
        root_id = create_folder_structure(service, company_name)

        if root_id:
            print("\n" + "=" * 60)
            print("🎉 SUCCESS! Your document management system is ready!")
            print("=" * 60)

    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        print("\nPlease check:")
        print("1. credentials.json file is in the same folder")
        print("2. You have internet connection")
        print("3. You granted the necessary permissions")

if __name__ == '__main__':
    main()

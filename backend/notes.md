head into teh backend and start the virutal machine using this command 
'source venv/bin/activate'

if you are having troubles with the virtual engine try this:


Recreate the Virtual Environment:
Since it seems like the virtual environment may have been corrupted or its paths are no longer valid, the simplest solution is to recreate it. Navigate to your backend directory and recreate the virtual environment:
-
cd /home/te-piha/Dev/NRLDraft/backend
rm -rf venv  # Remove the old virtual environment
python3 -m venv venv  # Create a new virtual environment


Activate the Virtual Environment:
After recreating the virtual environment, you need to activate it:
-
source venv/bin/activate  # Activate the virtual environment


Install Required Packages:
Now that you have a fresh virtual environment, install the necessary packages:
-
pip install Flask requests  # Install Flask and requests
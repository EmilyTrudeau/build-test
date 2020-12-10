---
id: tutorial_AddSubjectsToCollectionExcludingThoseInACSV
title: Add subjects to collection excluding those in a CSV  
sidebar_label: Add subjects to collection excluding those in a CSV
slug: /tutorial-Add-subjects-to-collection-excluding-those-in-a-CSV
---
**Title**: Add subjects to collection excluding those in a CSV  
**Date**: 6 April 2020  
**Description**:  
* Parse an input csv
* Add subjects from a project to a collection excluding those in input csv

# Install and import dependencies


```python
# Install specific packages required for this notebook
!pip install flywheel-sdk tqdm pandas 
```


```python
# Import packages
from getpass import getpass
import logging
import os
from pathlib import Path
import re

import pandas as pd
from tqdm.notebook import tqdm

import pandas as pd
import flywheel
from permission import check_user_permission

```


```python
# Instantiate a logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger('root')
```

# Flywheel API Key and Client

Get a API_KEY. More on this in the Flywheel SDK doc [here](https://flywheel-io.gitlab.io/product/backend/sdk/branches/master/python/getting_started.html#api-key).


```python
API_KEY = getpass('Enter API_KEY here: ')
```

Instantiate the Flywheel API client


```python
fw = flywheel.Client(API_KEY if 'API_KEY' in locals() else os.environ.get('FW_KEY'))
```

Show Flywheel logging information


```python
log.info('You are now logged in as %s to %s', fw.get_current_user()['email'], fw.get_config()['site']['api_url'])
```

# Constants


```python
# Source project.label to be used for adding to collection
PROJECT_LABEL = 'MyProject'
# Target collection label
COLLECTION_LABEL = 'MyCollection'
# CSV file path
CSV_PATH = 'path/to/file.csv'  
SUBJECT_COL = 'SubjectID'
```

# Main script

## Get or create the collection


```python
collection = fw.collections.find_first(f'label={COLLECTION_LABEL}')
if not collection:
    collection_id = fw.add_collection({'label': COLLECTION_LABEL})
    collection = fw.get(collection_id)
```

## Get find first project with that label


```python
project = fw.projects.find_first(f'label={PROJECT_LABEL}')
```

## CSV parsing

Load the csv file and extract subject label to be excluded


```python
df = pd.read_csv(CSV_PATH, dtype={'SubjectID': str})
subjects_to_exclude = df[SUBJECT_COL].values
df.head()
```

## Add subject to collection unless listed in csv

Loops through the subjects in the project and add to collection unless the `subject.label` is part of the subject to be excluded (e.g. in `subjects_to_exclude`).


```python
subjects = project.subjects()
for sub in tqdm(subjects):
    if sub.label not in subjects_to_exclude:
        for ses in sub.sessions():
            collection.add_sessions(ses.id)
```

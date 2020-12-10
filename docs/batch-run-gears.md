---
id: tutorial_BatchRunFlywheelGearsWithSDK
title: Batch Run Flywheel Gears with SDK   
sidebar_label: Batch Run Flywheel Gears with SDK    
slug: /tutorial-Batch-Run-Flywheel-Gears-with-SDK
---
**Title**: Batch Run Flywheel Gears with SDK
**Date**:  May 13th 2020 
**Description**:  
This notebook provides an overview of the Flywheel Gears and how to run gears as a batch with SDK.
Topics that will be covered:
- Overview of Flywheel Gears
- Upload gears to Flywheel
- Batch Run Gears
- Gear Output 
- Gear Rules VS Batch Run Gears

### **Requirements**:
1. Access to a Flywheel instance.
4. No Gear Rules applied in the Test Project.
2. A Flywheel Project with ideally the dataset used in the [upload-data notebook](https://gitlab.com/flywheel-io/public/flywheel-tutorials/-/blob/master/python/upload-data-to-a-new-project.ipynb).

**NOTE:** This notebook is using a test dataset provided by the [upload-data notebook](https://gitlab.com/flywheel-io/public/flywheel-tutorials/-/blob/master/python/upload-data-to-a-new-project.ipynb). If you have not uploaded this test dataset yet, we strongly recommend you do so now following steps in [here](https://gitlab.com/flywheel-io/public/flywheel-tutorials/-/blob/master/python/upload-data-to-a-new-project.ipynb) before proceeding because this notebook is based on a specific project structure.


:::alert
    **WARNING**: The metadata of the acquisitions in your test project will be updated and new files will be created after running the scripts below. 
:::alert

# An Overview of Flywheel Gears
Flywheel categorizes the gears into Utility Gears and Analysis Gears. 
- **Utility Gear** is typically a basic pipeline that generates another representation of the data (e.g. convert DICOM to NifTI), perform QA (e.g. A QA tool that generates a reqport) or a Classifier (e.g. extracts the data/header info of a file).
- **Analysis Gear** is a pipeline which processes the data with and algorithm, such as signal processing algorithm, and generates one or more files to be used for statistical analysis and/or machine learning.  See [below](#gear_rule_note) for a note on using analysis gears in gear rules.


In this notebook, we will be mainly focusing on **Utility Gears** but the same principle can be applied to **Analysis Gears**. 

***

# Install and Import Dependencies


```python
# Install specific packages required for this notebook
!pip install flywheel-sdk pydicom pandas
```


```python
# Import packages
from getpass import getpass
import logging
import os
from pathlib import Path
import re
import time
import pprint

from IPython.display import display, Image
import flywheel
import pandas as pd
from permission import check_user_permission

```


```python
# Instantiate a logger
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger('root')
```

# Flywheel API Key and Client

Get a API_KEY. More on this at in the Flywheel SDK doc [here](https://flywheel-io.gitlab.io/product/backend/sdk/branches/master/python/getting_started.html#api-key).


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

***

# Initialize a few values

Define your test Project's Label and let's look for it on your Flywheel instance.


```python
PROJECT_LABEL = input('Please enter your Project Label here: ')
```


```python
project = fw.projects.find_first(f'label={PROJECT_LABEL}')
```

***

# Requirements

Before starting off, we want to check your permission on the Flywheel Instance in order to proceed in this notebook. 


```python
min_reqs = {
"site": "developer",
"group": "ro",
"project": ['jobs_view',
             'jobs_run_cancel']
}
```

:::alert
**Tip:** Group ID and Project Label can be found on top of the Project page on the Flywheel Instance as shown in the snippet below.
:::

![End Group ID And Project Label](https://gitlab.com/flywheel-io/public/flywheel-tutorials/-/raw/master/python/assets/find-group-id-and-project-label.png)

```python
GROUP_ID = input('Please enter the Group ID that you will be working with: ')
```

`check_user_permission` will return True if both the group and project meet the minimum requirement, else a compatible list will be printed.


```python
check_user_permission(fw, min_reqs, group=GROUP_ID, project=PROJECT_LABEL)
```

***

# Set Up Flywheel CLI 

Flywheel Gears can be uploaded via the Flywheel CLI, which is a tool that allows us to interact with Flywheel and out data from the command line. 

:::alert
**TIP**: If you are curious what you can do with Flywheel CLI, [see our article here](https://docs.flywheel.io/hc/en-us/articles/360008285193).
:::





Here we will be showing you how you can install the CLI for Linux Operating System, such as the one used by Binder or Google Collab environments.


First we will be getting your instance specific CLI version.



```python
LATEST_CLI_VERSION = fw.get_version().cli_version
```

The Flywheel CLI builds are hosted on google storage at the following URL:


```python
CLI_URL = f'https://storage.googleapis.com/flywheel-dist/cli/{LATEST_CLI_VERSION}/fw-linux_amd64.zip'
```

:::alert
**NOTE**: If you are interested for more detailed instruction and installation guide for other Operating system, please refer to our [docs](https://docs.flywheel.io/hc/en-us/articles/360008162214-Installing-the-Command-Line-Interface-CLI).
:::


To install the Flywheel CLI we need to donwload, unzip and add the `fw` to somewhere in your `$PATH` (here we will be using your current working directory).


```python
# create a directory
! mkdir cli
```


```python
# Download Flywheel CLI to ./cli
! wget {CLI_URL} -O ./cli/fw-cli.zip
# unzip
! unzip ./cli/fw-cli.zip -d ./cli/
# move fw CLI to current directory
! cp ./cli/linux_amd64/fw fw
```

You can use `fw -h` to view all the commands available on Flywheel CLI


```python
!./fw -h
```

You should be able to log in with your API key with the command below.


```python
!./fw login {API_KEY}
```

If you successfully logged in with you API key, then you should see the message:

`You are now logged in as <username>!`


***


## Upload Flywheel Gears to Flywheel Instance

Now, we will upload the following Gears to your Flywheel Instance using the Flywheel CLI: 
- DCM2NIIX (a Converter Gear).
- MRIQC (a Quality Assessment of MRI). 

You can find a list of available Gears at our [Flywheel Gear Exchange](https://flywheel.io/gear-exchange/) page. 



```python
# create a new directory to store the gear files.
!mkdir fw-gears

# git clone dcm2niix gear from github repo
!git clone https://github.com/scitran-apps/dcm2niix.git ./fw-gears/dcm2niix
    
# git clone mriqc gear from the github repo 
!git clone https://github.com/flywheel-apps/mriqc.git ./fw-gears/mriqc
```

Now we will be uploading the MRIQC gear into the flywheel instance using the `fw gear upload` command.


```python
# change your path to the gear directory
os.chdir('./fw-gears/mriqc')
```


```python
!./fw gear upload
```

:::alert
**NOTE**: These gears might be alrady installed on your Flywheel instance. So, you might receive a message saying that the gears exist when you are uploading the gear to your Flywheel instance.
:::

We will be repeating the same process for DCM2NIIX Gear


```python
# change your path to the gear directory
os.chdir('../dcm2niix')
```


```python
!./fw gear upload
```

***

# Batch Run Gears

## Useful Function

This `run_gear` function will be used to run gears in this notebook. 


```python
def run_gear(gear, inputs, dest):
    """Submits a job with specified gear and inputs.
    
    Args:
        gear (flywheel.Gear): A Flywheel Gear.
        inputs (dict): Input dictionary for the gear.
        dest (flywheel.container): A Flywheel Container where the output will be stored.
        
    Returns:
        str: The id of the submitted job.
        
    """
    try:
        # Run the gear on the inputs provided, stored output in dest constainer and returns job ID
        gear_job_id = gear.run(inputs=inputs, destination=dest)
        log.debug('Submitted job %s', gear_job_id)
        return gear_job_id
    except flywheel.rest.ApiException:
        log.exception('An exception was raised when attempting to submit a job for %s',
                      file_obj.name)
```

## Main Scripts

### Run DICOM-2-NifTI Gear

We first retrieve the gear by looking it up:


```python
dcm_2_nifti_gear =  fw.lookup('gears/dcm2niix')
```

Then, for each acquisition container in each session container we:
1. Get the dicom file and define it as `inputs`.
2. Get the destination container (here defined as the parent container of the file, i.e. the Acquisition Container the file is in in this example). 
3. Submit the job.


```python
# Initialize dcm_2_nifti_job_list
dcm_2_nifti_job_list = list()
# Iterate over project sessions
for session in project.sessions.iter():
    # Iterate over sessions acquisition
    for i, acq in enumerate(session.acquisitions.iter()):
        for file_obj in acq.files:
            # We only want DICOMs
            if file_obj.type == 'dicom':
                inputs = {'dcm2niix_input':file_obj}
                dest = file_obj.parent
                job_id = run_gear(dcm_2_nifti_gear, inputs, dest)
                dcm_2_nifti_job_list.append(job_id)
        if i > 5:
            # we process only the first 5 acquisition in each session
            break
```

:::alert
**TIP**: The format for the 'inputs' for a given gear is a dictionary of key-value pairs, where the key corresponds to the manifest input label (which can be found on the Flywheel Instance, see the figure below) and the value is the value of the item.
:::

![manifest input label](https://gitlab.com/flywheel-io/public/flywheel-tutorials/-/raw/master/python/assets/manifest-input-label.png)


For `dicom-2-nifti` gear, the required manifest input label is `dcm2niix_input` and the value of the input is the `file_obj`.

### Run MRIQC Gear




We can repeat the same operation for the MRIQC gear.


```python
mriqc_gear = fw.lookup('gears/mriqc')
```


```python
# Initialize mriqc_job_list
mriqc_job_list = list()
# Iterate over project sessions
for session in project.sessions.iter():
    # Iterate over sessions acquisition
    for i, acq in enumerate(session.acquisitions.iter()):
        for file_obj in acq.files:
            # We only want DICOMs
            if file_obj.type == 'nifti':
                inputs = {'nifti':file_obj}
                dest = file_obj.parent
                job_id = run_gear(mriqc_gear, inputs, dest)
                mriqc_job_list.append(job_id)
            if i > 5:
                break
```

:::alert
    NOTE: This gear might takes more than 5 minutes to execute.
:::


## Checking Job Status

You can check your job status by using the `get_job()` method.


```python
for job in mriqc_job_list:
    job_info = fw.get_job(job)
    log.info('Submitted Job Status: %s', job_info.state)
```

You can also check the job status on the Flywheel Instance as well. 

This can be done on the `Provenance` tab as shown on the snippets below:

![check gear status](https://gitlab.com/flywheel-io/public/flywheel-tutorials/-/raw/batch-run-gears/python/assets/check-gear-status.png)


You can also find other gears' status that have been completed earlier. 

***

# Gear Outputs

## Output on the Flywheel Instance
On the `Provenance` tab, you can also find out the output name that generated after the job has been processed. These output files can be downloaded or viewed from the UI as shown below:


![Download output file](https://gitlab.com/flywheel-io/public/flywheel-tutorials/-/raw/master/python/assets/download-view-output-file-pt1.png)

![download output file 2](https://gitlab.com/flywheel-io/public/flywheel-tutorials/-/raw/master/python/assets/download-view-output-file-pt2.png)



## Download/View Output with SDK 

You can also view or download all of the outputs to your destination path

In this section, we will be demonstrating how to download all of the outputs that were generated from the `mriqc` Gears by our batch run.


```python
# Path where the input files will be download
PATH_TO_DOWNLOAD = Path('results')
PATH_TO_DOWNLOAD.mkdir(exist_ok=True, parents=True)
```


```python
# Iterate over project sessions
for session in project.sessions.iter():
    session = session.reload()
    # Create a new directory for each session
    session_path = PATH_TO_DOWNLOAD / session.label
    # Here we will create the session directory if it does not exist in the path
    session_path.mkdir(exist_ok=True, parents=True)
    # Iterate over the acquisitions containers
    for acq in session.acquisitions.iter():
        for file_obj in acq.files:
            # We only want QA 
            if file_obj.type == 'qa':
                # Download the file to dest_path with the same file name on FW
                dest_path = session_path / file_obj.name
                # Here we will download the file if it is not there.
                if not dest_path.exists():
                    file_obj.download(dest_path)
                else:
                    print("File exists!")    
```

You can also generate a summary table of the QC values from each output file.


```python
# Create a new DataFrame
mriqc_df = pd.DataFrame()

# Path to directory you want to store the csv files
dest_path = PATH_TO_DOWNLOAD
```


```python
# Iterate over project sessions
for session in project.sessions.iter():
    session = session.reload()
    # Iterate all the acquisitions container
    for acq in session.acquisitions.iter():
        acq = acq.reload()
        for file_obj in acq.files:
            # We only want QA 
            if file_obj.type == 'qa':
                tmp_dict = {}
                for info, value in file_obj.info.items():
                    # This is used to check if the value is a dictionary and whether they are bids metadata
                    if isinstance(value, dict) and info == "bids_meta":
                        tmp_dict.update(value)
                    elif isinstance(value, dict) == False:
                        tmp_dict[info] = value

                # Appending all of the info into the DataFrame
                mriqc_df = mriqc_df.append(tmp_dict, ignore_index=True).drop(
                    "dataset", axis=1
                )
                    
```


```python
# Create a new path with desired CSV file name
dest_path = PATH_TO_DOWNLOAD / "mriqc_output.csv"

# Display the DataFrame
display(mriqc_df)

# Convert DF to CSV file and save to the path initialize earlier
mriqc_df.to_csv(dest_path, index=False)
```

***


# Gear Rules VS Batch Run Gears

With Gear Rules, you can automatically run the gears above when new data is added to a project.

:::alert
**TIP**: A default Gear Rules might have already set up for the gears above, this can be found in the `Gear Rules` tab in your project container.
:::

However, Gear Rules can not be applied to gears that use Flywheel SDK unless these gears have the [`read-only` key](https://github.com/flywheel-io/gears/tree/master/spec#api-keys) added to them. Click [here](https://docs.flywheel.io/hc/en-us/articles/360039790914-Can-I-choose-an-analysis-gear-in-a-Gear-Rule-) to read more about this topic.

:::alert
**TIP**: To learn more about gear rules and how to use them, please visit our documentations [here](https://docs.flywheel.io/hc/en-us/articles/360008553133-Project-Gear-Rules).
:::

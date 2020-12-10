---
id: QuickStart
title: Quick Start
sidebar_label: Quick Start Guide
slug: /Quickstart
---
Chances are you want to do one of three things in Flywheel:

1.  Find your data

2.  Download your data

3.  Create new containers and upload your data

Here we will cover the basics for each topic

Finding Data
------------
Flywheel has two primary methods to find data using the SDK:

1.  Finders

2.  Queries

Finders
-------
Each container type has it’s own finder in flywheel. It their most basic form, finders will return all possible matches. Finders are called with the .find() method.

To specify what container type you’re looking for, it can be called after a container type from the flywheel client:

-   fw.projects.find()

-   fw.subjects.find()

-   fw.sessions.find()

etc.

In this case, each finder will return EVERY project/subject/session that you have access to on the site.

This is equivalent to simply calling:

-   fw.projects()

-   fw.subjects()

-   fw.sessions()

Until you place filter arguments in find()

You can pass in filters to limit the containers returned. The filters can set conditions based off of the containers’ metadata. For example, if you want to only get subjects that belong to a certain project, you can filter for that property as follows:
```python
fw.subjects.find(‘project=<PROJECT_ID>’)
```
Alternatively, you can search for all subjects DIRECTLY from that project’s container object:
```python
project = fw.get_project('<PROJECT_ID>')
subjects = project.subjects.find()
# OR
subjects = project.subjects()
```
Further, finders can be applied here as well:
```python
subject = project.subjects.find(‘created\>2018-10-31’)
```
Will return all subjects created after October 31st, 2018, in the given project.

find\_first & iter\_find
---------------------------------------------------------
There are two other varieties of finders:

1.  find\_first()

2.  iter\_find()

These two behave exactly as find() in that they can be called directly from the client:

-   fw.subjects.find\_first()

-   fw.sessions.iter\_find()

or from a container:
```python
project = fw.get_project('<PROJECT_ID>')
subjects = project.subjects.find_first()
sessions = project.sessions.iter_find()
```

Additionally, they can take filter arguments just like find():
```python
fw.subjects.find_first(“label=’My Subject’”)
```
They differ in what they return.

**\*find\_first\*** stops searching flywheel when it finds the first match, and returns that match. This can be useful to simply see if your search is working, and if ANY data is matching to it.

**\*iter\_find\*** returns an iterator. This can be useful for searches that return large numbers of containers. find() will retrieve the metadata of every container that matches the search filter, generate a list of that data for python, and return that to your terminal. This can take time when hundreds or thousands of search results need to be returned. iter\_find() returns an iterator that sends the metadata for the matching containers one at a time, rather than all at once.

This can be useful when there is some sort of processing loop that you’re doing to your data.

For example, appending a keyword to all subjects created after a certain date:
```python
project = fw.get_project('<PROJECT_ID>')

# INCORRECT - This method will be slow 
# if there is a large number of subjects
subjects = project.subjects.find('created>2019-09-09')
for sub in subjects:
    label = sub.label
     sub.update({'label':f"old_cohort_{label}"})


# CORRECT - This method will be faster than 
# the one above if there is a large number of subjects
subjects = project.subjects.iter_find('created>2019-09-09')
for sub in subjects:
    label = sub.label
    sub.update({'label':f"old_cohort_{label}"})


sessions = project.sessions.iter_find()
```
[Queries](#h_01ENKEFTAFQ44ZGHTZWC6JHH9B)
----------------------------------------

Queries are an extension of our advanced search function in the SDK.

You can generate queries just like you’d generate an advanced search, and passing the query into the `fw.search()` function:
```python
age = 64

query = f'session.age >= 0 AND session.age <= {age} AND ' \
        f'project.label = Sample AND ' \
        f'file.classification.Measurement = T1 AND ' \
        f'file.info.PatientIdentityRemoved = YES'

results = fw.search({'structured_query': query, 'return_type': 'acquisition'}, size=10000)
```
you must specify the query and the return type. The return type specifies which container type it will return, regardless of what the query criteria is. This will return any containers who have a parent or child container that the query criteria satisfies.

the size parameter specifies the number of results to return, typically limited to 100, with a maximum of 10000.

As an example, the following query would return all subjects in the project labeled “Test Project”:
```python
query = 'project.label = "Test Project"'
results = fw.search({'structured_query': query, 'return_type': 'subject'}, size=10000)
```
And likewise, the following query would return all subjects who have a child acquisition named “multi\_echo”:
```python
query = 'acquisition.label = multi_echo'
results = fw.search({'structured_query': query, 'return_type': 'subject'}, size=10000)
```
Downloading Data
----------------
All containers in Flywheel can be downloaded.
The easiest way to download an entier container is simply to use [\`download\_tar() https://flywheel-io.gitlab.io/product/backend/sdk/branches/master/python/flywheel.html?highlight=download\_tar\#flywheel.client.Client.download\_tar\`\_](#id2) which takes the following arguments:
-   containers
-   dest\_file
-   include\_types
-   exclude\_types
for example:
```python
fw.download_tar([acquisition], '/tmp/acquisition.tar')
```
Additionally, you can donwload individual files using the download() function:
```python
files = session.files
file_to_download = files[0]
download_location = f"/tmp/{file_to_download.name}"
file_to_download.download(download_location)
```
Create a New Group
-----------------
This section outlines some basic commands commonly used when creating and modifying Flywheel projects.
SO you’re a new Flywheel PI, all bright-eyed and bushy-tailed! Ready to take a first crack at getting your data up to the cloud! Time to take advantage of all the great things we sold you on! Let’s just dive right in then! First make sure you’ve read the previous section and have installed the SDK. It’s also a good idea to install and log in with the CLI. Once that’s all taken care of, we can begin exploring our instance. You may not be the first lab to join this flywheel instance, so let’s quickly take a look at the groups that already exist in our instance (that we have access to see):
```python
import flywheel

fw = flywheel.Client()

groups = fw.groups()
print(f"GROUPS:\n"
        f"ID{'':10} LABEL\n"
        "------------------------------")

for group in groups:
    print(f"{group.id:12} {group.label}")
```
Any groups you can see here, you have access to or are part of. If you see a group you’d like to use for your new project, we can grab it using the `fw.get()` command, and pass in the group ID (printed using the command above):
```python
my_group = fw.get('group-id')
```
Or you can create a new group (if you have the correct site permissions): Note that “id” must be a lowercase string with no spaces. It’s a good idea to make this relatively short, as it will be used to access your group programmatically, and no one wants to type out ‘my\_very\_long\_descriptive\_group\_id’. The group “label” on the other hand can be a human friendly name with spaces.
```python
new_group = flywheel.Group(id='my_id', label='My Label')
my_group_id = fw.add_group(new_group)  # Returns the group id as a string
my_group = fw.get(my_group_id)
```
Setting Group Permissions
-------------------------
By default, You will have admin permissions on any group that you create. You may wish to modify these permissions, or add other users to the group.

Let’s add an example user to our group with “read write” permissions:
```python
# Access Types:
# 'admin'- admin
# 'rw' - read/write
# 'ro'- read only

access_type = 'rw'
user_id = 'example@user.com
my_group.add_permission({'access':access_type, '_id':user_id})
```
Group Roles
-----------
Roles are different from group permissions - Roles apply to Project access within a given group. [Roles and permissions](https://flywheel-io.gitlab.io/product/backend/sdk/branches/master/python/data_model.html#permissions) is a detailed topic that we suggest you review. Here we will only demonstrate how to use them. Custom roles can be made, giving you granular control over a user’s access to a project. For example, you cna create a role where a user ONLY has permission to modify metadata, but not files.

Typically, you would have to create and name your own roles before assigning them here. However, flywheel does provide three default roles that you can always use: \#. admin \#. read/write \#. read only

Below is a quick example of how to get these default roles and add them to your group. Remember that these roles define the permissions that we can assing users for PROJECTS within this group, and do not directly indicate what permissions a user has regarding what they can do to the GROUP itself.
```python
admin_id = [role.id for role in fw.get_all_roles() if role.default_flywheel_role == 'admin'].pop()
rw_id = [role.id for role in fw.get_all_roles() if role.default_flywheel_role == 'rw'].pop()
ro_id = [role.id for role in fw.get_all_roles() if role.default_flywheel_role == 'ro'].pop()

fw.add_role_to_group(my_group.id, {'_id': admin_id})
fw.add_role_to_group(my_group.id, {'_id': rw_id})
fw.add_role_to_group(my_group.id, {'_id': ro_id})
```
These are now roles we can assign to users on individual projects within the group.

Create a new Project
--------------------
Now that we have our group, let’s add a project to it. If we didn’t just create this group, there may already be projects in it. Let’s check and see what projects exist already, so we know what names we can’t use:
```python
import flywheel

project = my_group.projects()
print(f"GROUP{'':10} PROJECT")
print("----------------------------------")
for project in projects:
    print(f"{project.group:15} {project.label}")
```
Now let’s choose a name for our new project that doesn’t already exist:
```python
new_project_label = "My New Project"
project = group.add_project(label=new_project_label)
```
Add a Subject to a Project
--------------------------
Now that we have our new project, let’s add a new subject to it. You can simply specify the label as above, but you can also specify any of the metadata fields covered in the “Subject Object” header of the “Quick Reference” Section. [LLL]. We will take advantage of that and specify the sex and name of this subject:
```python
metadata = {
'label': 'Subject2',
'firstname': 'Lisa',
'lastname': 'Simpson',
'sex': 'female'
}

subject = project.add_subject(metadata)
```
###  

### [EXAMPLE: Bulk add a list of subjects](#h_01ENKEM1JK9YFCP6NVPR6644DF)

In this example, we have a csv file with five columns:

|subject ID|FirstName|LastName|sex|
|:---------|:--------|:-------|:--|
|sub001|Lisa|Simpson|female|
|sub002|Bart|Simpson|male|
|…|…|…|…|
|subxxx| | | |
```python
import csv

# Load the subject CSV:
with open('/Users/davidparker/Desktop/testcsv.csv') as csvfile:
    csv_reader = csv.DictReader(csvfile, delimiter=',')

    # Get the header
    header = csv_reader.fieldnames
    print(',\t'.join(header))

    # Loop through the remaining entries and upload to flywheel
    for row in csv_reader:
        subid = row['Subject ID']
        first = row['FirstName']
        last = row['LastName']
        sex = row['sex']

        metadata = {
            'label': subid,
            'firstname': first,
            'lastname': last,
            'sex': sex
            }

        subject = project.add_subject(metadata)
     
```
####  

### [EXAMPLE: Set permissions for a list of users across multiple projects](#h_01ENKEMHPMFTC4B92NRT2KPCDD)

Let’s say you have a list of user ID’s, and a permission level that they should have for all projects in a group:

|User ID|Permission Level|
|:------|:---------------|
|[user1@site.com](mailto:user1%40site.com)|admin|
|[user2@site.com](mailto:user2%40site.com)|rw|
|[user3@site.com](mailto:user3%40site.com)|admin|
|…|…|
|[userX@site.com](mailto:userX%40site.com)|ro|

NOTE that this code will assign access to EVERY project within a given group. Extreme caution must be taken when assigning user permissions to ensure that ONLY the correct access is given to the correct projects.

###  

Add a Session to a Subject
--------------------------
We can now add a new session to this subject. We could again use a python dictionary to create this session with metadata already included. Sessions can have the metadata fields specified in the “Session Object” header of the “Quick Reference” section [LLL].:
```python
metadata = {
    'label': 'Session1',
    'age': 20 * 365 * 24 * 60 * 60, # Age in seconds at time of scan
    'weight': 140
    }

session = subject.add_session(metadata)
```
Add an Acquisition to a Session
-------------------------------

Let’s create a simple acquisition to house a simple anatomical T1 image:

In the next section we will upload a file to this acquisition. But before we continue, we will set a unique metadata field to acquisitions: the Timestamp.

#### Acquisition Timestamp

The acquisition timestamp is a time-zone specific timestamp for when the file within the acquisition was created, or when the scan took place. This is different from the Flywheel metadata tags `Created` and `Modified`, which refer to when the container was created and modified in Flywheel. To set the acquisition timestamp, you must know the time/date/timezome when the data was acquired:

Upload a file to an Acquisition
-------------------------------
We are now ready to upload our scan to the acquisition:
```python
file_path = "/path/to/file/T1_Image.nii.gz"
flywheel_file = acquisition.upload_file(file_path)

# In turn, we can download this file as follows:
acquisition.download_file('T1_Image.nii.gz','/path/to/downloaded/file/T1_Image.nii.gz')
```
####  

Setting file Metadata
---------------------
If we have metadata on this file (Such as dicom header fields, or any kind of BIDS sidecar .json file), we can add it to the `info` section of the flywheel metadata for that file. this info will be visible in the UI under the “Custom Information” tab. The metadata must be passed in as a python dictionary. The original format of this data can be arbitrary (csv, yaml, json, etc), as long as you can load the
```python
# Load in metadata as a python dictionary as key/value pairs.
# This can be any format, but we'll assume we have it saved as a .json file

import json


with open('file_info.json') as json_file:
    metadata = json.load(json_file)

flywheel_file.update_info(metadata)
```
###  

Uploading many files to an Acquisition
--------------------------------------
Multiple files can be uploaded by either creating a script with nested for loops, or by using the `fw upload` [CLI command](https://docs.flywheel.io/hc/en-us/articles/360007657833-Importing-Data-with-CLI).

 

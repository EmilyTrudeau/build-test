---
id: SettingObjectMetadata
title: Setting Object Metadata
sidebar_label: Setting Object Metadata
slug: /SettingObjectMetadata
---
[Setting Object Metadata](#h_01ENTAND25V6KBEZA7JJFTNAWY)
========================================================

Once an object is created, it’s common to want to set or modify certain metadata parameters. Object metadata is stored in key/value pairs. Flywheel provides some default keys that all (or most) objects will share, such as “creation date”, “label”, and “parents”. There is also a custom field titled “info” that users can upload any amount custom key/value pairs to. These examples will show how to set some common parameters, as well as the custom info.

[Metadata Format](#h_01ENTAPFZY8N3GVFJ3CCFG7JBZ)
------------------------------------------------

Metadata is passed to flywheel in the form of key/value pairs using the update() function, with a few specific exceptions that will be covered. In the Python SDK, these key/value pairs are stored as dictionaries. For example, updating the label of a container in Flywheel would typically be done with the python dict `{‘label’:’new\_label’}`, and called as follows:
```python
container.update({'label':'new_label'})
```
Certain keys expect values of a certain data type. For example, label expects a string, and timestamp expects a timestamp from the datetime python package. Other metadata keys have special functions for modifying them, such as tags and notes. Finally, some metadata fields cannot be modified after creation, such as created, modified, and id.

[Setting Acquisition Timestamps](#h_01ENTAWGDA7MHBE4KVWPRNCC24)
---------------------------------------------------------------

Acquisition objects have timestamp fields that indicate the date of acquisition of the file. This is separate from the created and modified fields, which only pertain to the creation and modification of the file in Flywheel.

The timestamp object requires a [datetime](https://docs.python.org/3.3/library/datetime.html) object, with a timezone included. Working with timezones in any programming language can be…tricky to say the least. We recommend that you review some [documentation](https://howchoo.com/g/ywi5m2vkodk/working-with-datetime-objects-and-timezones-in-python#enter-timezones) on the subject, but a simple example will be provided below:
```python
from datetime import datetime
import pytz


# Get a session object in flywheel:
session = fw.get_session('5f185ffd957ea0084cc8a85f')

# Create an acquisition
acq = ses.add_acquisition(label='MyNewAcquisition')

# get a timezone object, in this case UTC:
timezone = pytz.utc

# Create a timestamp for when the acquisition was taken (outside of flywheel)
# datetime can specify year, month, day, hour, minute, second millisecond, and timezone:
# Let's set the date for January 1st, 4:30am, 2020.  Better times.
acq_time = datetime(2020, 1, 1, 4, 30, tzinfo=timezone)

# Now update the acquisition's timestamp
acq.update({'timestamp': acq_time})
```
[Containers](#h_01ENTAW1RW02WNHY67PZDCXG3F)
===========================================

Projects, Subjects, Sessions, Acquisitions and Analyses are all different types of *Containers*. Containers in Flywheel all support the following features:

[Tags](#h_01ENTAWVZA0NGNFP3N26TF6A8Z)
=====================================

Tags are concise labels that provide descriptive metadata that can be searched on. Available tags are managed on the Group.
```python
# See tags on a session
session = fw.get(session_id)
print(', '.join(session.tags))

# Add a tag to a session
session.add_tag('Control')

# Remove a tag from a session
session.delete_tag('Analysis Required')
```
[Notes](#h_01ENTAX5NMT6MCEA1DKX7JNPMR)
======================================

Notes are user-entered, human readable metadata attached to a container. They are timestamped and attributed to the user that entered them.
```python
from pprint import pprint

# See notes on a session
session = fw.get(session_id)
pprint(session.notes)

# Add a note to a session
session.add_note('This is a note')

# Delete a note from a session
session.delete_note(session.notes[0].id)
```
[Info](#h_01ENTAXDF5TYWMFB49QYKCBSDY)
=====================================

Info is free-form JSON metadata associated with a container or file.
```python
from pprint import pprint

 # Print the info for an acquisition
acquisition = fw.get(acquisition_id)
pprint(acquisition.info)

# Replace the entire contents of acquisition info
acquisition.replace_info({ 'splines': 34 })

# Add additional fields to acquisition info
acquisition.update_info({ 'curve': 'bezier' })

# Delete fields from acquisition info
acquisition.delete_info('splines')
```
[Files](#h_01ENTAXNGZ19XZK1KET53CEVC1)
======================================

Files are a set of file attachments associated with a container. See also [Dealing with Files](python_sdk_with_r.html#dealing-with-files).
```python
from pprint import pprint

# List files on an acquisition
acquisition = fw.get(acquisition_id)

for f in acquisition.files:
    print('Name: %s, type: %s' % (f.name, f.type))

# Upload a file to an acquisition
acquisition.upload_file('/path/to/file.txt')

# Download a file to disk
acquisition.download_file('file.txt', '/path/to/file.txt')

# Files can also have metadata
pprint(acquisition.files[0].info)

acquisition.replace_file_info('file.txt', {'wordCount': 327})
```
### [File Classification](#h_01ENTAY0A5P62EHDW8ZFWC785X)

Flywheel supports an extensible, multi-dimenstional classification scheme for files. Each dimension of classification is referred to as an aspect. The available aspects are determined by the file’s modality.

For example, the `MR` modality provides the `Intent`, `Measurement` and `Features` aspects. In addition, the `Custom` aspect is always available, regardless of modality.
```python
from pprint import pprint

# Display the aspects defined in the MR modality
mr = fw.get_modality('MR')
pprint(mr)

# Replace a file's modality and classification
acquisition.replace_file_classification('file.txt', {
        'Intent': ['Structural'],
        'Measurement': ['T2']
}, modality='MR')

# Update a file's Custom classification, without changing
# existing values or modality
acquisition.update_file_classification('file.txt', {
        'Custom': ['value1', 'value2']
})

# Delete 'value1' from Custom classification
acquisition.delete_file_classification('file.txt', {
        'Custom': ['value1']
})
```
[Timestamps [NEW]](#h_01ENTAYC8DS88FBBGVJV4SXK7P)
-------------------------------------------------

Objects with timestamps and created/modified dates provide helper accessors to get those dates in the local (system) timezone, as well as the original timezone in the case of acquisition and session timestamps.

For example:
```python
# Acquisition Timestamp (tz=UTC)
print(acquisition.timestamp.isoformat())

# Acquisition Timestamp (tz=Local Timezone)
print(acquisition.local_timestamp.isoformat())

# Acquisition Timestamp (tz=Original Timezone)
print(session.original_timestamp.isoformat())
```
###  

[Age at Time of Session [NEW]](#h_01ENTAYQZ3C5JK22RDGVG1WHY3)
-------------------------------------------------------------

Sessions have a field for subject age at the time of the session, in seconds. There are also helper accessors to get age in years, months, weeks and days.

For example:
```python
# Subject age in seconds
print('Subject was {} seconds old', session.age)

# Subject age in years
print('Subject was {} years old', session.age_years)
```
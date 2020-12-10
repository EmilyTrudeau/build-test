---
id: containers
title: Containers
sidebar_label: Containers
slug: /containers
---

Projects, Subjects, Sessions, Acquisitions and Analyses are all different types of *Containers*. Containers in Flywheel all support the following features:

[Tags](#h_01ENTFCJEYAQAM2S8K3JB6KT24)
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
[Notes](#h_01ENTFCWQ2R65QTEQG6HBHKMRG)
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
[Info](#h_01ENTFD8JHNA8VJY0PM0PS7YZZ)
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
[Files](#h_01ENTFDG6FWDEQA90ZRENXQRS6)
======================================

Files are a set of file attachments associated with a container. See also [Dealing with Files](/knowledge/revisions/QnJhbmQ6MzYwMDAwMDc3NzUz/QXJ0aWNsZTozNjAwNTgzOTg5NTM6OA==/python_sdk_with_r.html#dealing-with-files).
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
[File Classification](#h_01ENTFDSG1ATYHJKPCXG6TYGSC)
----------------------------------------------------

Flywheel supports an extensible, multi-dimenstional classification scheme for files. Each dimension of classification is referred to as an aspect. The available aspects are determined by the file’s modality.

For example, the `MR` modality provides the `Intent`, `Measurement` and `Features` aspects. In addition, the `Custom` aspect is always available, regardless of modality.
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
[Timestamps [NEW]](#h_01ENTFE8F44FEZ3ZW6K3R75HBF)
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
[Age at Time of Session [NEW]](#h_01ENTFEMKVNY81V73QTDABWHCB)
-------------------------------------------------------------

Sessions have a field for subject age at the time of the session, in seconds. There are also helper accessors to get age in years, months, weeks and days.

For example:
```python
# Subject age in seconds
print('Subject was {} seconds old', session.age)

# Subject age in years
print('Subject was {} years old', session.age_years)
```
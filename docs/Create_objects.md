---
id: CreateObjects
title: Creating Objects
sidebar_label: Creating Objects
slug: /CreatingObjects
---
[Add Group](#h_01ENTAKCZXCZCV83SQ64PJYY2C)
==========================================

Create a new group, with an id of `my_group` and a label of `My Test Group`:
```python
group_id = fw.add_group(flywheel.Group('my_group', 'My Test Group'))
```
[Add Project](#h_01ENTAKY7JK778YVNQMV2VEQVE)
============================================

Create a new project that belongs to `group_id` with a label of `My Test Project`.
```python
project = group.add_project(label='My Test Project')
```
[Add Subject](#h_01ENTAMD7RSGSV4VWBSEFKGWWE)
============================================

Create a new subject with a label of `Subject 01`
```python
subject = project.add_subject(label='Subject 01')
```
[Add Session](#h_01ENTAMR9YSPDGQ39V5J2999AW)
============================================

Create a new session with a label of `Session 01`.
```python
session = subject.add_session(label='Session 01')
```
[Add Acquisition](#h_01ENTAN3C9TSBV2ZBTRWJJRR2Q)
================================================

Create a new acquisition with a label of `Localizer`, and upload a file.
```python
acquisition = session.add_acquisition(label='Localizer')

acquisition.upload_file('localizer.nii.gz')
```
---
id: views
title: Flywheel Views
sidebar_label: Flywheel Views
slug: /views
---
Often times it is useful to get attributes across a large number of objects in the Flywheel hierarchy. One possible way of retrieving fields in such a manner would be looping over each level in the hierarchy, collecting the desired fields at each level. This is problematic because it is tedious to write and inefficient to execute.

A view is an abstraction that describes how to collect and aggregate data on a Flywheel instance. Views are defined as a set of columns to collect and are executed against a container (such as a project, subject or session). In addition, tabular or JSON file data may be aggregated from files, even files that are members of archives, or part of analysis output.

Data views provide an alternative way to efficiently aggregate data across the hierarchy in a tabular way, producing results like this:

|project.label|subject.age|subject.sex|acquisition.label|trial\_type|response\_time|accuracy|
|:------------|:----------|:----------|:----------------|:----------|:-------------|:-------|
|color study|1040688000|male|task-redBlue|go|1.435|1|
|color study|1040688000|male|task-redBlue|stop|1.739|0|
|color study|851472000|female|task-redBlue|go|1.379|1|
|color study|851472000|female|task-redBlue|stop|1.534|1|

Loading An Existing View
------------------------
Views that already exist on flywheel can be accessed through the SDK using the get\_view() command:

``` python
{.code .highlight .js-syntax-highlight .python .white lang="python"}
# Load a data view
view = fw.get_view(<view_ID>)
```

the view ID can be found in the URL on the UI when accessing a data view.

A list of data views available on the site can be found with the ???? command

Creating A View
----------------

Views can be created using the [`ViewBuilder`](flywheel.html#flywheel.view_builder.ViewBuilder "flywheel.view_builder.ViewBuilder") class, or the short-hand [`View()`](flywheel.html#flywheel.flywheel.Flywheel.View "flywheel.flywheel.Flywheel.View") method. At a minimum, one column or file must be specified when creating a data view. A simple example would be to create a view that collects all of the built-in subject columns:
```python
# Build a data view
view = fw.View(columns='subject')
```
Executing A View
----------------
A View object doesn’t become useful until you execute it against a container. View results can be loaded directly into memory, or saved to a file. If the [pandas](https://pandas.pydata.org/) python package is available, you can also load view results directly into a DataFrame. Finally, you can also save the results of a view execution directly to a container as a file.

[Load JSON View](#h_01ENTHD3T9Z15672MNKA6MCJM4)
-----------------------------------------------
```python
import json
with fw.read_view_data(view, project_id) as resp:
        data = json.load(resp)
```
[Load pandas DataFrame](#h_01ENTHDFVD64GPD8Y20HK0XAFQ)
------------------------------------------------------

    df = fw.read_view_dataframe(view, project_id)

[Save DataFrame to Local CSV](#h_01ENTHDV28S26WXADYQ9KJCKH6)
------------------------------------------------------------

    fw.save_view_data(view, project_id, '/tmp/results.csv', format='csv')

[Data Formats](#h_01ENTHE6FAJCBPPGQNRD85X3CR)
=============================================

The following output formats are supported:

-   json - The default format. Results will be returned as an array of objects, one per row.

-   json-row-column - A second json format where columns are separate from rows, and rows is an array of arrays.

-   json-flat - Similar to json, except that instead of an object, the rows are the top level array.

-   csv - Comma-separated values format

-   tsv - Tab-separated values format

Data format can be specified on any of the data view execution functions.

[Columns](#h_01ENTHEG0M1J21VQ6P6KJDZPRP)
========================================

Data view columns are references to container fields in the form of `<container>.<field>`.

A current list of pre-defined columns and groups of columns is available via the [`print_view_columns()`](flywheel.html#flywheel.flywheel.Flywheel.print_view_columns "flywheel.flywheel.Flywheel.print_view_columns") method. For example:
```
project (group): All column aliases belonging to project
project.id (string): The project id
project.label (string): The project label
project.info (string): The freeform project metadata
subject (group): All column aliases belonging to subject
subject.id (string): The subject id
subject.label (string): The subject label or code
subject.firstname (string): The subject first name
subject.lastname (string): The subject last name
subject.age (int): The subject age, in seconds
subject.info (string): The freeform subject metadata
...
```
Adding the `project` group column will result in `project.id` and `project.label` being added. Likewise adding the `subject` group column will result in the subject `id`, `label`, `firstname`, `lastname`, `age` (and more) columns being added to the view.

[Info Columns](#h_01ENTHETTYN91SW49M2RD7TY0B)
---------------------------------------------

The `info` columns are unique in that they represent the unstructured metadata associated with a container. As such, they are not included in the column groups, and behave a little bit differently. If the output data format is CSV or TSV, then a set of columns are extracted from the first row encountered, which is generally the first object created. This may result in unexpected behavior if info fields are not uniform across each object. It’s better in most cases to explicitly state which info fields you wish as columns: e.g. `subject.info.IQ`.

[Files](#h_01ENTHF3F7J6SFW5QWS74A70AW)
--------------------------------------

Rows can also be extracted from CSV, TSV and JSON files that are present on the Flywheel instance. This can be done with the view builder by specifying which `container` type to find files on and a `filename` wildcard match. In addition, analysis files can be matched by specifying `analysis_label`, `analysis_gear_name` and/or `analysis_gear_version`.

For example:
```python
# Read all columns from files named behavioral_results_*.csv on each session
view = fw.View(container='session', filename='behavioral_results*.csv')

# Read Mean_Diffusivity.csv results from the newest AFQ analyses on each session, and include session and subject labels
builder = flywheel.ViewBuilder(columns=['subject.label', 'session.label'], container='session', analysis_gear_name='afq', filename='Mean_Diffusivity.csv')
builder.file_match('newest')
builder.file_column('Left_Thalamic_Radiation', type='float')
builder.file_column('Right_Thalamic_Radiation', type='float')
view = builder.build()
```
[Saving Views](#h_01ENTHFD4X0J7BJXKY9PPW0YSW)
---------------------------------------------

View definitions can be saved to your user account, or any project you have access to. For example:
```python
me = fw.get_current_user().id
subjects_view = fw.View(label='Subject Info', columns=['subject'])
view_id = fw.add_view(me, subjects_view)
```
Then you can execute the view any time against any container
``` python
df = fw.read_view_dataframe(view_id, project_id)
```
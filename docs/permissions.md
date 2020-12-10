---
id: permissions
title: Permissions
sidebar_label: Permissions
slug: /permissions
---

These are Permissions in Flywheel are managed at the Group and Project level. Users that belong to a Group or a Project have a Role, which by default is one of:

-   **Admin** (`admin`) - Administrators can perform administrative-level actions such as setting permissions or creating and deleting projects.

-   **Read-Write** (`rw`)- Users can read, create and delete data, but cannot assign permissions or delete entire projects.       `

-   **Read-Only** (`ro`) - Users can only read data

By default when a new Project is created belonging to a Group, permissions will be copied from the Group to the Project, keeping user roles intact. From that point on, permissions for that Project must be managed at that project, changes made to the Group will not propagate to the project.
```python
    from pprint import pprint

    # See project permissions
    project = fw.get(project_id)
    pprint(project.permissions)

    # Add permission to a project
    project.add_permission(flywheel.Permission('justinehlert@flywheel.io', 'ro'))

    # Remove permission from a project
    project.delete_permission('justinehlert@flywheel.io')
```
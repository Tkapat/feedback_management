# CampusVoice — User Roles and Features

This report describes the two user roles in the CampusVoice feedback system and the features available to each role as a user.

## Student

A student can log in, submit feedback, track submissions, and receive notifications.

### Authentication
- Log in with email and password.
- Register a new account with name, email, roll number, department, and password.

### Dashboard
- View a personal summary of feedback submissions.
- See quick status counts (pending, in review, resolved, rejected).

### Give Feedback
- Select a feedback category: Teaching, Classroom, Laboratory, Faculty, Library, Cleanliness, or Other services.
- Select the department related to the feedback.
- For Teaching feedback, select a subject and the assigned faculty, and give a rating out of 5.
- Add optional quick tags to describe the issue.
- Write a detailed comment (minimum 10 characters).
- Attach optional proof images (up to 5 images, 5 MB each).
- Choose to submit anonymously so the administrator cannot see the student's identity.
- Submit feedback when the feedback window is open.

### Feedback History
- View a list of all submitted feedback with category, date, and status.
- Filter submissions by status (all, pending, in review, resolved, rejected).
- Open any submission to see full details.

### Feedback Details
- View the comment, category, department, subject, faculty, rating, tags, and status.
- See attached proof images; click any image to view it full size in a floating modal and download it.
- View the status timeline showing when the feedback moved between statuses.
- Read replies sent by the administrator.

### Notifications
- View notifications about feedback updates and announcements.
- Mark individual notifications as read.
- Mark all notifications as read at once.

## System Administrator

An administrator can manage all feedback, view analytics, maintain master data, and configure system settings.

### Authentication
- Log in with admin email and password.

### Dashboard
- View key performance indicators: total feedback, average rating, pending count, and resolved percentage.
- View feedback distribution by category.
- View average rating and total feedback per faculty and department.
- See monthly feedback trends.
- View top faculty and top departments by feedback volume.
- View top concerns (most used tags and frequent keywords from complaints).

### Feedback Management
- View all student feedback across the college in a table.
- Filter feedback by status and department.
- Open any feedback in a detail drawer to see the full comment, proof images, ratings, and tags.
- Change the status of a feedback (pending, in review, resolved, rejected).
- Toggle priority flag on important feedback.
- Send replies to students; replies update the feedback status to "In Review".
- Export all feedback to a CSV file.

### Analytics
- Explore feedback statistics grouped by faculty, subjects, or departments.
- View average ratings and feedback mix for each group.

### Master Data Management
- Manage departments (add, edit, activate/deactivate).
- Manage faculty members (add, edit, activate/deactivate).
- Manage subjects (add, edit, assign faculty and semester, activate/deactivate).

### Students
- View the list of all registered students.
- Search students by name, email, or roll number.

### Settings
- Open or close the feedback submission window for all students.
- Set the current feedback cycle.
- Manage quick tags available to students.

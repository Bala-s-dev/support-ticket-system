#!/bin/sh

echo "Waiting for postgres..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done
echo "PostgreSQL started"

# Create project if it doesn't exist
if [ ! -f "manage.py" ]; then
    django-admin startproject core .
fi

python manage.py migrate
python manage.py runserver 0.0.0.0:8000
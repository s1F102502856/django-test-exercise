from django.shortcuts import render, redirect
from django.http import Http404
from django.utils.timezone import make_aware
from django.utils.dateparse import parse_datetime
from todo.models import Task
from todo.models import HighScore
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
import base64
from pathlib import Path
from PIL import Image
from io import BytesIO


# Create your views here.
def index(request):
    if request.method == 'POST':
        task = Task(title=request.POST['title'],
                    due_at=make_aware(parse_datetime(request.POST['due_at'])))
        task.save()

    if request.GET.get('order') == 'due':
        tasks = Task.objects.order_by('due_at')
    else:
        tasks = Task.objects.order_by('-posted_at')

    context = {
        'tasks': tasks,
    }
    return render(request, 'todo/index.html', context)


def detail(request, task_id):
    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        raise Http404("Task does not exist")

    context = {
        'task': task,
    }
    return render(request, 'todo/detail.html', context)

def update(request, task_id):
    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        raise Http404("Task does not exist")
    if request.method == 'POST':
        task.title = request.POST[ 'title' ]
        task.due_at = make_aware(parse_datetime(request.POST['due_at']))
        task.save()
        return redirect(detail, task_id)

    context = {
        'task': task
    }
    return render(request, "todo/edit.html", context)

def delete(request, task_id):
    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        raise Http404("Task does not exist")

    task.delete()
    return redirect(index)


def snake(request):
    return render(request, 'todo/snake.html')

def shateki(request):
    return render(request, 'todo/shateki.html')

def matoate(request):
    return render(request, 'todo/matoate.html')

def kingyo(request):
    return render(request, 'todo/kingyo.html')


def timer(request):
    return render(request, 'todo/timer.html')


def video_editor(request):
    return render(request, 'todo/video_editor.html')


def remove_background(request):
    return render(request, 'todo/remove_background.html')


@csrf_exempt
def save_transparent_image(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    try:
        payload = json.loads(request.body.decode('utf-8'))
        image_data = payload.get('image', '')
        if not image_data:
            return JsonResponse({'error': 'image required'}, status=400)
        header, encoded = image_data.split(',', 1)
        image_bytes = base64.b64decode(encoded)
        img = Image.open(BytesIO(image_bytes)).convert('RGBA')

        width, height = img.size
        data = img.getdata()
        new_data = []
        for item in data:
            r, g, b, a = item
            if a < 10:
                new_data.append((r, g, b, a))
            elif r > 220 and g > 220 and b > 220:
                new_data.append((r, g, b, 0))
            else:
                new_data.append((r, g, b, a))
        img.putdata(new_data)

        target_path = Path(__file__).resolve().parent / '魚' / 'sakanatakusan.jpe'
        img.save(target_path, format='JPEG')
        return JsonResponse({'ok': True, 'path': str(target_path)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def save_score(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    try:
        payload = json.loads(request.body.decode('utf-8'))
        game = payload.get('game')
        score = int(payload.get('score', 0))
        if not game:
            return JsonResponse({'error': 'game required'}, status=400)
        HighScore.objects.create(game=game, score=score)
        return JsonResponse({'status': 'ok'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

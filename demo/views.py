from django.contrib import auth, messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from demo.forms import SignupForm


@login_required
def dashboard(request):

    if request.user.is_staff:
        messages.success(request, 'HI! Employee!!!!')

    return render(request, 'demo/dashboard.html')


def signup(request):

    form = SignupForm(request.POST or None)

    if form.is_valid():
        # auth.login(request, form.signup_user)

        return redirect('login')

    context = {
        'form': form,
    }

    return render(request, 'demo/signup.html', context)

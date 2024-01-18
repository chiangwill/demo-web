from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.db import IntegrityError, transaction
from django.utils.translation import ugettext_lazy as _

from demo import validators
from demo.models import User


class SignupForm(forms.Form):

    username = forms.CharField(
        label=_('帳號'),
        validators=[validators.validate_username],
        help_text=_('帳號只能包含英文字母、數字、底線且長度介於 3 ~ 30 個字元'),
    )
    password = forms.CharField(
        label=_('密碼'),
        widget=forms.PasswordInput(attrs={'password': True}),
        validators=[validators.validate_password],
        help_text=_('長度須介於 5 ~ 30 個字元'),
    )
    password_confirm = forms.CharField(
        label=_('再輸入一次密碼'),
        widget=forms.PasswordInput(attrs={'password': True}),
    )
    is_staff = forms.ChoiceField(
        label=_('是否為員工'),
        widget=forms.RadioSelect,
        required=True,
        choices=[('True', _('是')), ('False', _('否'))],
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['username'].widget.attrs['account'] = True

    def clean_password_confirm(self):
        password = self.cleaned_data.get('password')
        password_confirm = self.cleaned_data.get('password_confirm')

        if password and password != password_confirm:
            self.add_error('password_confirm', _('密碼不相符'))

        return password_confirm

    def clean(self):
        cleaned_data = super().clean()

        username = cleaned_data.get('username')
        password = cleaned_data.get('password')
        is_staff = cleaned_data.get('is_staff')

        if not self.errors:
            try:
                with transaction.atomic():
                    self.signup_user = User.objects.create_user(username, password=password, is_staff=is_staff)
            except IntegrityError:
                raise ValidationError(_('無法建立帳號，請檢查您所輸入的資訊'))

        return cleaned_data


class LoginForm(AuthenticationForm):
    error_messages = {
        'invalid_login': _('登入失敗，請輸入正確的帳號與密碼'),
        'inactive': _('此帳號未啟用'),
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['username'].label = _('帳號')
        self.fields['username'].widget.attrs['account'] = True

        self.fields['password'].label = _('密碼')
        self.fields['password'].widget.attrs['password'] = True

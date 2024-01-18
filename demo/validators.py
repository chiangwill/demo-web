from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.utils.translation import ugettext_lazy as _

from demo.models import User

validate_password = RegexValidator(r'^\S{5,30}$', _('密碼長度須介於 5 ~ 30 個字元'))
validate_username_format = RegexValidator(r'^[a-zA-Z0-9_]{3,30}$', _('帳號只能包含英文字母、數字、底線且長度介於 3 ~ 30 個字元'))


def validate_registered_username(value):
    if User.objects.filter(username__iexact=value).exists():
        raise ValidationError(_('這個帳號已經被註冊了'))


def validate_username(value):
    validate_username_format(value)
    validate_registered_username(value)

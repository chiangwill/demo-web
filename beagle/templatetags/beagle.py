# coding: utf-8

from django import forms, template
from django.template.loader import get_template

register = template.Library()


@register.filter
def beagle(element):
    """
    把 form fields render 成 beagle theme 的樣式
    """

    element_type = element.__class__.__name__.lower()

    if element_type == 'boundfield':
        add_input_classes(element)
        template = get_template('beagle/field.html')
        context = {'field': element}
    else:
        has_management = getattr(element, 'management_form', None)
        if has_management:
            # 目前還沒有用到 management_form，也還沒有寫 formset.html，所以先 pass !
            pass
            """
            for form in element.forms:
                for field in form.visible_fields():
                    add_input_classes(field)

            template = get_template('beagle/formset.html')
            context = {'formset': element}
            """
        else:
            for field in element.visible_fields():
                add_input_classes(field)

            template = get_template('beagle/form.html')
            context = {'form': element}

    return template.render(context)


def add_input_classes(field):
    """
    依照不同的 field widget 加上相對應的 class attribute
    """

    field_classes = field.field.widget.attrs.get('class', '')

    if is_file(field):
        field_classes = '{} inputfile'.format(field_classes)
    elif not is_radio(field) and not is_multiple_checkbox(field) and not is_checkbox_input(field):
        if 'form-control' not in field_classes:
            field_classes = '{} form-control'.format(field_classes)
    elif 'custom-control-input' not in field_classes:
        field_classes = '{} custom-control-input'.format(field_classes)

    field.field.widget.attrs['class'] = field_classes.strip()


@register.filter
def is_radio(field):
    return isinstance(field.field.widget, forms.RadioSelect)


@register.filter
def is_multiple_checkbox(field):
    return isinstance(field.field.widget, forms.CheckboxSelectMultiple)


@register.filter
def is_date(field):
    return isinstance(field.field.widget, forms.DateInput)


@register.filter
def is_datetime(field):
    return isinstance(field.field.widget, forms.DateTimeInput)


@register.filter
def is_checkbox_input(field):
    return isinstance(field.field.widget, forms.CheckboxInput)


@register.filter
def is_file(field):
    return isinstance(field.field.widget, forms.FileInput)

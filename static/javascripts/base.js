$(document).ready(function(){
    //-initialize the javascript
    App.init();

    //利用js-cookie紀錄點擊burger的縮放
    $('.be-toggle-left-sidebar').click(function(){
        Cookies.set('status', $('#burger').attr('class'))
    });
    $(function(){
        if(Cookies.get('status')){
            $('#burger').attr('class', Cookies.get('status'))
        }
    });

    /*
     * Beagle 的上傳檔案比較特別，需要這一段設定才能顯示所選擇的檔案
     * 這一段設定其實在 App.formElements() 裡面有
     * 但目前我們還沒用到 bootstrap-slider 所以用了會噴錯
     * 之後有開始用到 bootstrap-slider 的話就可改用 App.formElements()
    */
    $('.inputfile').each(function() {
        var e = $(this),
            t = e.next('label'),
            i = t.html();
        e.on('change', function(e) {
            var o = '';
            this.files && this.files.length > 1 ? o = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length) : e.target.value && (o = e.target.value.split('\\').pop()), o ? t.find('span').html(o) : t.html(i)
        })
    })

    /* 選取主曲風後動態顯示相對應的子曲風 */
    if ($('select[name=main_genre]').length > 0) {
        $('select[name=main_genre]').select2({
            width: '100%',
        });
        $('select[name=main_genre]').change(function() {
            /*
             * 從 djangojs 取得的 url 會帶有語系，而且從網頁上切換語系後取得的 url 之語系不會跟著一起變更
             * 所以會導致主曲風名稱比對失敗，拿不到相對應的子曲風選單
             * workaround 是把語系從 url 中移除
            */
            url = Django.url('pa:get-sub-genre-options');
            if (url.includes('/zh-hant')) {
                url = url.replace('/zh-hant', '');
            }
            else if (url.includes('/zh-hans')) {
                url = url.replace('/zh-hans', '');
            }
            else if (url.includes('/en')) {
                url = url.replace('/en', '');
            }

            $.ajax({
                type: 'GET',
                url: url,
                data: {'main_genre_name': $(this).val()},
                success: function(data) {
                    $('select[name=sub_genre]').empty();
                    $('select[name=sub_genre]').html(data['rendered_sub_genre_options']);
                },
            });
        })
    }
    if ($('select[name=sub_genre]').length > 0) {
        $('select[name=sub_genre]').select2({
            width: '100%',
        });
    }

    /* 語言切換 */
    $('input.language').change(function() {
        $('form#set-language').submit();
    });

    /* 篩選列表中若有數個輸入框，則 focus 在關鍵字輸入框時按下 enter 就馬上 submit form */
    $('input#id_keyword').on('keypress', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            // 由於 datetimepicker 的 calendar icon button 是 form 中的第二個 input
            // 所以在關鍵字輸入框中按下 enter 後就會自動顯示 datetimepicker 選單
            // 目前尚無法從 datetimepicker 的選項中關掉此功能
            // 當 keypress 時就把 datetimepicker 的 calendar icon button 設為 disabled
            $('span.input-group-append button.btn-secondary').prop('disabled', true);
            $(this).closest('form').submit();
        }
    });

    /* 查看異動紀錄 */
    $('[data-target="#modal-auditlog"]').click(function(){
        $('div#modal-auditlog').data('content-type-id', $(this).data('content-type-id'));
        $('div#modal-auditlog').data('pk', $(this).data('pk'));
        $('div#modal-auditlog').data('filter-field', $(this).data('filter-field'));
    })
    $('div#modal-auditlog').on('show.bs.modal', function () {
        $('.modal .modal-body').css('overflow-y', 'auto');
        $('.modal .modal-body').css('max-height', $(window).height() * 0.7);

        var data = {
            'content_type_id': $(this).data('content-type-id'),
            'pk': $(this).data('pk'),
            'filter_field': $(this).data('filter-field'),
        }

        $.ajax({
            type: 'GET',
            url: Django.url('pa:get-auditlog'),
            data: data,
            success: function(result){
                $('div#modal-auditlog').modal('show');
                $('div#auditlog-modal-body').html(result);
            }
        })
    })
    $('th.auditlog-th').each(function(){
        var removable = 0;
        var table = $(this).parents('table');
        var tds = table.find('tr td:nth-child(' + ($(this).index() + 1) + ')');

        tds.each(function() {
            if ($(this).find('a').length == 0) {
                removable++;
            }
        });
        if (removable == (table.find('tr').length - 1)) {
            $(this).hide();
            tds.hide();
        }
    })
});

//重設filter條件
function formReset(){
    $('input[type=text]').attr('value', '');
    $('input[type=number]').attr('value', '');
    $('input[type=checkbox]').attr('checked', false);
    $("input[type=radio][value='']").attr('checked', true);
    $('select').val('').change();
    $('label').removeClass('active');
}

function buttonDisabled(){
    $('.btn').attr('disabled', true)
}

// plupload 的預設選項
var plupload_base_options = {
    browse_button : 'pickfiles',
    url: $('#pickfiles').data('url'),
    multi_selection: false,
    unique_names: true,
    headers : {
        'X-Requested-With' : 'XMLHttpRequest',
        'X-CSRFToken' : Cookies.get('csrftoken'),
    },

    init: {
        FilesAdded: function(uploader, files) {
            $('#upload-progress-bar').attr('aria-valuenow', 0);
            $('#upload-progress-bar').css('width', '0%');

            uploader.start();
        },
        UploadProgress: function(uploader, file) {
            $('.progress').show();

            var percent_text = file.percent + '%';
            $('#upload-progress-bar').attr('aria-valuenow', file.percent);
            $('#upload-progress-bar').css('width', percent_text);
            $('#upload-progress-bar').text(percent_text);
        },
    }
}

function get_plupload_options_for_images(max_file_size='10mb', chunk_size='2mb') {

    var plupload_options_for_images = $.extend(true, {}, plupload_base_options);

    plupload_options_for_images.max_file_size = max_file_size;
    plupload_options_for_images.chunk_size = chunk_size;
    plupload_options_for_images.filters = {
        mime_types: [
            {
                title : 'Image files',
                extensions : 'jpg,jpeg,png',
            },
        ]
    };
    plupload_options_for_images.init.FileUploaded = function(uploader, file, response) {
        $('.progress').hide();

        location.reload();
    };
    plupload_options_for_images.init.Error = function(uploader, error) {
        $('.progress').hide();

        if (error.status == 400) {
            alert(JSON.parse(error.response).error_message);
        }
        else if (error.code == -600) {
            alert(gettext('圖檔大小不能超過 ') + max_file_size);
        }
    };

    return plupload_options_for_images;
}

function get_plupload_options_for_audio_files(chunk_size='16mb') {

    var plupload_options_for_audio_files = $.extend(true, {}, plupload_base_options);

    plupload_options_for_audio_files.chunk_size = chunk_size;
    plupload_options_for_audio_files.filters = {
        mime_types: [
            {
                title : 'Audio files',
                extensions : 'wav,flac',
            },
        ]
    };
    plupload_options_for_audio_files.init.FileUploaded = function(uploader, file, response) {
        $('.progress').hide();

        var json_response = JSON.parse(response.response);
        if (json_response.status == 'error') {
            alert('請上傳大於 44.1khz / 16bit 的雙聲道（stereo）WAV 或 FLAC 音檔');
        } else {
            alert('檔案上傳成功！');
        }
    };

    return plupload_options_for_audio_files;
}

$('div#picbox').on('click', function() {
    $('#imageUpload').trigger('click');
});

$(function(){
    var picbox = $('.picbox'),
        back = $('.back', picbox);
    var errors = [];

    picbox.filedrop({
        paramname:'pic',
        maxfilesize: 2,
        maxfiles: 3,
        url: 'upload.php',

        uploadFinished: function(i,file,response){
            console.log(response);
            if (response.success == false) {
                for (i in response) {
                    if (i != 'success') {
                        // console.log('<p>' + response[i] +'</p>');
                        $('<p class="errorMessage">' + response[i] + '</p>').insertAfter($('.picbox'));
                    }
                }
//                   response.pop(response.success).map(function(k, v) {
//                       console.log('hi');
//                   });
            }
            $.data(file).addClass('done');
            $('.uploaded').show();
        },
        error: function(err, file){
            switch(err){
                case 'BrowserNotSupported':
                    showMessage('Your browser does not support HTML5 file uploads');
                    break;
                case 'TooManyFiles':
                    alert('You went over the max number of files');
                    break;
                case 'FileTooLarge':
                    alert(file.name+' is too big, please upload a smaller image');
                    errors.push(file.name+' is too big, please upload a smaller image');
                    break;
                default:
                    break;
            }
        },

        beforeEach: function(file){
            if(!file.type.match(/^image\//)){
                alert('Your file is not an image');
                return false;
            }
        },
        uploadStarted: function(i, file,len){
            createImage(file);
        },
        progressUpdated: function(i, file, progress){
            $.data(file).find('.progress').width(progress);
        }
    });

    var template = '<div class="preview">'+
        '<span class="imageHolder">'+
        '<span class="uploaded"></span>'+
        '<img />'+
        '</span>'+
        '<div class="progressHolder">'+
        '<div class="progress"></div>'+
        '</div>'+
        '</div>';

    function createImage(file){
        var preview = $(template),
            image = $('img',preview);

        var reader = new FileReader();

        image.width = 100;
        image.height = 100;

        reader.onload = function(e){
            image.attr('src',e.target.result);
        };

        reader.readAsDataURL(file);

        back.hide();
        preview.appendTo(picbox);

        $.data(file,preview);
    }

    function showMessage(msg){
        back.html(msg);
    }
});

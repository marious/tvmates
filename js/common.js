function TemplateObject()
{
    "use strict";
    var _registerForm = '#register-form';
    var _loginForm = '#login-form';
    var _url = window.root;
    var _formUrl = window.root + '/register.php';
    var _loginFormUrl = window.root + '/login.php';


    function _wrapValidation(message) {
        return '<span class="errorMessage">' + message + '</span>';
    }


    function _validation(validation, status) {
        var status = status || '';
        $.each(validation, function(k, v) {
            if (k == 'birth_date') {
                $('div.select-boxes').after(_wrapValidation(v[0]));
                $('div.select-boxes select').addClass('warningInputField').on('change', function() {
                    $(this).removeClass('warningInputField');
                    $('div.select-boxes').next('.errorMessage').remove();
                });
            }
            $('#' + status + k).addClass('warningInputField');
            $('#' + status + k).after(_wrapValidation(v[0]));
            $('#' + status + k).on('focusin', function() {
                $(this).removeClass('warningInputField');
                $(this).next('.errorMessage').remove();
            });
        });
    }

    function _displayMessage(thisForm, message) {
        thisForm.find('div').after(message);
    }


    function _clearFormValidation(thisForm) {
        thisForm.find('.errorMessage').remove();
    }



    function _reset() {
        thisForm[0].reset();
    }



    function _successRegisterModal(msg)
    {

        var  modal = '<div class="modal bs-example-modal-lg"  id="successRegister" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel">';
        modal += '<div class="modal-dialog modal-lg" role="document">';
        modal += '<div class="modal-content">';
        modal += '<img src="/img/success-checkmark.png">';
        modal += '<p>'+ msg +'</p>';
        modal += '</div>';
        modal += '</div>';
        modal += '</div>';
        return modal;
    }


    function _submitRegisterForm()
    {
        $(document).on('submit', _registerForm, function(e) {
            e.preventDefault();
            e.stopPropagation();

            var thisForm = $(this);
            var thisArray = thisForm.serializeArray();

            $.post(_formUrl, thisArray, function(data) {
                if (data.error == false) {
                    var modal = _successRegisterModal(data.successMsg);
                    $(modal).insertAfter('footer');
                    $('#registerModal').modal('hide');
                    $('#successRegister').modal('show');
                } else if (data.error == true) {
                    _clearFormValidation(thisForm);
                    _displayMessage(thisForm, data.message);
                    _validation(data.validation);
                }
            }, 'json');
        });
    }




    function _submitLoginForm()
    {
        $(document).on('submit', _loginForm, function(e) {
            e.preventDefault();
            e.stopPropagation();

            var thisForm = $(this);
            var thisArray = thisForm.serializeArray();

            $.post(_loginFormUrl, thisArray, function(data) {
                if (data.error == false) {
                    window.location.href = window.root;
                } else if (data.error == true) {
                    _clearFormValidation(thisForm);
                    _displayMessage(thisForm, data.message);
                    _validation(data.validation, 'login-');
                }
            }, 'json');
        });
    }



    function _submitBeHost1()
    {
        $(document).on('submit', '#host-step-1', function(e) {
            e.preventDefault();
            e.stopPropagation();

            var thisForm = $(this);
            var thisArray = thisForm.serializeArray();

            $.post(window.root + '/host-step-1.php', thisArray, function(data) {
                _addSpinner('button.host-btn i');
                if (data.error == false) {
                    console.log('hi');
                    window.location.href = window.root + '/host-step-2.php'
                } else if (data.error == true) {
                    _removeSpinner('button.host-btn i');
                    _clearFormValidation(thisForm);
                    _displayMessage(thisForm, data.message);
                    _validation(data.validation);
                }
            }, 'json');

        });
    }




    function _submitBeHost2()
    {
        $(document).on('submit', '#host-step-2', function(e) {
            e.preventDefault();
            e.stopPropagation();

            var thisForm = $(this);
            var thisArray = thisForm.serializeArray();

            $.post(window.root + '/host-step-2.php', thisArray, function(data) {
                _addSpinner('button.host-btn i');
                if (data.error == false) {
                    console.log('hi');
                    window.location.href = window.root + '/host-step-3.php'
                } else if (data.error == true) {
                    _removeSpinner('button.host-btn i');
                    _clearFormValidation(thisForm);
                    _displayMessage(thisForm, data.message);
                    _validation(data.validation);
                }
            }, 'json');

        });
    }




    function _submitBeHost3()
    {
        $(document).on('submit', '#host-step-3', function(e) {
            e.preventDefault();
            e.stopPropagation();

            var thisForm = $(this);
            var thisArray = thisForm.serializeArray();

            $.post(window.root + '/host-step-3.php', thisArray, function(data) {
                _addSpinner('button.host-btn i');
                if (data.error == false) {
                    console.log('hi');
                    window.location.href = window.root + '/host-step-4.php'
                } else if (data.error == true) {
                    _removeSpinner('button.host-btn i');
                    _clearFormValidation(thisForm);
                    _displayMessage(thisForm, data.message);
                    _validation(data.validation);
                }
            }, 'json');

        });
    }



    function _submitBeHost4()
    {
        $(document).on('submit', '#host-step-4', function(e) {
            e.preventDefault();
            e.stopPropagation();

            var thisForm = $(this);
            var thisArray = thisForm.serializeArray();

            $.post(window.root + '/host-step-4.php', thisArray, function(data) {
                _addSpinner('button.host-btn i');
                if (data.error == false) {
                    console.log('hi');
                    window.location.href = window.root + '/finish-host.php';
                } else if (data.error == true) {
                    _removeSpinner('button.host-btn i');
                    _clearFormValidation(thisForm);
                    _displayMessage(thisForm, data.message);
                    _validation(data.validation);
                }
            }, 'json');

        });
    }






    function _addSpinner(el) {
        $(el).addClass('spinner ion-loop');
    }

    function _removeSpinner(el) {
        $(el).removeClass('spinner ion-loop');
    }



    this.init = function() {
        _submitRegisterForm();
        _submitLoginForm();
        _submitBeHost1();
        _submitBeHost2();
        _submitBeHost3();
        _submitBeHost4();
    }
}



(function(){

    $('#registerModal div.sign-email').hide();
    $('#registerModal a.sign-with-email-btn').on('click', function(e) {
        e.preventDefault();
        $('#registerModal div.sign-socials').hide();
        $('#registerModal div.sign-email').show();
    });


    $('#showLoginButton').on('click', function(e) {
         $('#registerModal').modal('hide');
        $('#loginModal').show();
    });

    var obj = new TemplateObject();
    obj.init();


    if (window.location.hash && window.location.hash == '#_=_') {
        window.location.hash = '';
    }


    $('a.googleLink').on('click', function(e) {
        e.preventDefault();
        $.get(window.root + '/signup-google.php', function(data) {
            window.location.href = data.link;
        }, 'json')
    });

    $('a.facebookLink').on('click', function(e) {
        e.preventDefault();
        $.get(window.root + '/signup-facebook.php', function(data) {
            window.location.href = data.link;
        }, 'json')
    });


    $('a.register-btn').on('click', function(e) {
       e.preventDefault();
        $('#loginModal').modal('hide');
        $('#registerModal').modal('show');
    });


    $('div.have-account a.login-btn').on('click', function(e) {
       e.preventDefault();
        $('#registerModal').modal('hide');
        $('#loginModal').modal('show');
    });


    $('.avatar-photo').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var userInfo = $('.user-info');
        if (userInfo.is(':hidden')) {
            userInfo.show();
        } else {
            userInfo.hide();
        }
    });

    $(document.body).on('click', function() {
        var userInfo = $('.user-info');
        if (userInfo.css('display') != 'none') {
            userInfo.hide();
        }
    });


}());


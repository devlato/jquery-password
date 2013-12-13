

// Генератор паролей по алфавиту и длине или коллбеку
(function($, vendor) {
    var __pluginName = 'passwordGenerator';
    var __events = {
        click: 'click',                    // поле изменено
        regenerate: 'password.regenerate', // инициирует генерацию
        generated: 'password.generated',   // инициирует вставку
        inserted: 'password.inserted',     // пароль вставлен
        displayed: 'password.displayed',   // пароль показан
        reset: 'password.reset',           // сигнал сброса формы
        resetOk: 'password.resetOk'        // форма сброшена
    };
    var __methods = {
        getOptions: 'getOptions',          // получает настройки
        setOptions: 'setOptions',          // устанавливает настройки
        generate: 'generate',              // генерирует пароль,
        reset: 'reset'                     // сбрасывает форму
    };

    var PasswordGenerator = function(obj, options) {
        var __self = this;
        var __obj = obj;
        var __defaultOptions = {
            alphabet: 'ABCDEFGHIJKLMNOPQRSTVUWXYZabcdefghijklmnopqrstvuwxyz0123456789_-',
            length: 12,
            displayAfterInsert: true,
            events: __events,
            title: 'Generate random password',
            generate: false,
            view: {
                selectors: {
                    input: '.autogenerate-password',
                    trigger: '.regenerate-button',
                    wrapper: '.password-regenerate-wrapper'
                },
                templates: {
                    wrapper: '<div class="password-regenerate-wrapper">\
                                  <input type="password" class="autogenerate-password" value="" />\
                                  <div class="regenerate-button" title="<%= title %>"></div>\
                              </div>'
                }
            }
        };
        var __options = {};

        var __init = function(obj, options) {
            __self.setObject(obj);
            __self.setOptions(options);
            __self.attach();
            __self.bind();
            return __self;
        };

        __self.setObject = function(obj) {
            __obj = $(obj);
            return __self;
        };

        __self.getObject = function() {
            return __obj;
        };

        __self.setOptions = function(options) {
            __options = $.extend(true, {}, __defaultOptions, __self.getOptions(), options);
            return __self;
        };

        __self.getOptions = function() {
            return __options;
        };

        __self.attach = function() {
            var options, obj, parent, wrapper, placeholder, predecessor, container;
            options = __self.getOptions();
            obj = __self.getObject();
            parent = obj.parent();
            wrapper = $(vendor.render(options.view.templates.wrapper, {title: options.title}));
            placeholder = wrapper.find(options.view.selectors.input);
            predecessor = obj.prev();
            placeholder.replaceWith(obj);
            if (predecessor.length > 0) {
                predecessor.after(wrapper);
            } else {
                wrapper.prependTo(parent);
            }
            // placeholder.remove();
            return __self;
        };

        __self.getEventListener = function() {
            var obj = __self.getObject();
            var options = __self.getOptions();
            return obj.closest(options.view.selectors.wrapper);
        };

        __self.bind = function() {
            var options = __self.getOptions();
            var obj = __self.getObject();
            var listener = __self.getEventListener();

            listener.on(options.events.click, options.view.selectors.trigger, __self.onButtonClick);
            obj.on(options.events.regenerate/*, options.view.selectors.input*/, __self.onGenerateRequired);
            obj.on(options.events.generated/*, options.view.selectors.input*/, __self.onPasswordGenerated);
            obj.on(options.events.inserted/*, options.view.selectors.input*/, __self.onPasswordInserted);
            obj.on(options.events.reset/*, options.view.selectors.input*/, __self.onReset);
            return __self;
        };

        __self.generate = function() {
            var options, password, i, character;
            options = __self.getOptions();
            password = [];
            for (i = 0; i < options.length; i++) {
                character = options.alphabet[Math.floor(Math.random() * options.alphabet.length)];
                password.push(character);
            }
            return password.join('');
        };

        __self.generatePassword = function() {
            var options;
            options = __self.getOptions();
            if (options.generate && (typeof options.generate === 'function')) {
                return options.generate.apply(__self, []);
            }
            return __self.generate();
        };

        __self.onReset = function(e, data) {
            var options = __self.getOptions();
            var obj = __self.getObject();
            obj[0].type = 'password';
            obj.val('');
            obj.trigger(options.events.resetOk);
        };

        __self.onButtonClick = function(e, data) {
            var options = __self.getOptions();
            var obj = __self.getObject();
            obj.trigger(options.events.regenerate);
        };

        __self.onGenerateRequired = function(e, data) {
            var password = __self.generatePassword();
            var options = __self.getOptions();
            var obj = __self.getObject();
            obj.trigger(options.events.generated, [{password: password}]);
        };

        __self.onPasswordGenerated = function(e, data) {
            var obj = __self.getObject();
            var options = __self.getOptions();
            obj.val(data.password);
            obj.trigger(options.events.inserted);
        };

        __self.onPasswordInserted = function(e, data) {
            var obj = __self.getObject();
            var options = __self.getOptions();
            if (options.displayAfterInsert) {
                obj[0].type = 'text';  // Because jQuery doesn't allow this
                obj.trigger(options.events.displayed);
            }
        };

        return __init(obj, options);
    };

   function password(options) {
        var __self = $(this);

        return (function(args) {
            var command, options, optionsToGet, filter, passwordGenerator;

            if (args.length < 2) {
                command = args[0];
                switch (command) {
                    case __methods.getOptions:
                        passwordGenerator = __self[__pluginName].passwordGenerator;
                        return passwordGenerator.getOptions();
                    case __methods.generate:
                        __self.trigger(__events.regenerate);
                        break;
                    case __methods.reset:
                        __self.trigger(__events.reset);
                        break;
                    default:
                        options = {};
                        if (args && args[0]) {
                            options = args[0];
                        }
                        if (__self[__pluginName].passwordGenerator == null) {
                            options = $.extend({events: __events}, options);
                            __self[__pluginName].passwordGenerator = new PasswordGenerator(__self, options);
                        }
                }
            } else {
                passwordGenerator = __self[__pluginName].passwordGenerator;
                command = args[0];
                switch (command) {
                    case __methods.setOptions:
                        if (args.length == 2) {
                            options = args[1];
                            passwordGenerator.setOptions(options);
                        } else {
                            options = {};
                            options[args[1]] = args[2];
                            passwordGenerator.setOptions(options);
                        }
                        break;
                    case __methods.getOptions:
                        if (args.length == 2) {
                            optionsToGet = args[1];
                            options = passwordGenerator.getOptions();
                            if (typeof optionsToGet === 'string') {
                                return options[optionsToGet];
                            } else {
                                if (optionsToGet instanceof Array) {
                                    filter = function(item, key) {
                                        return (options[item] != null);
                                    };
                                } else {
                                    filter = function(item, key) {
                                        return (options[key] != null);
                                    };
                                }
                                return vendor.filter(optionsToGet, filter);
                            }
                        }
                        break;
                    default:
                        // TODO mmm?
                }
            }
            return __self;
        })(arguments);
    }

    $(function() {
        $.fn[__pluginName] = password;
    });
})(jQuery, {
    filter: function(collection, callback) {
        var result;
        if (collection instanceof Array) {
            result = [];
            for (var i = 0; i < collection.length; i++) {
                // result[i] = callback(collection[i], i);
                if (callback(collection[i], i)) {
                    result.push(collection[i]);
                }
            }
        } else if (typeof collection === 'object') {
            result = {};
            for (var key in collection) {
                if (!collection.hasOwnProperty(key)) {
                    continue;
                }
                if (callback(collection[key], key)) {
                    result[key] = collection[key];
                }
            }
        }
        return result;
    },
    render: _.template
});

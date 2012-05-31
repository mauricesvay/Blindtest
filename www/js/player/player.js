var socket;
var App = {

    currentSong : null,
    username : null,
    loggedIn : null,

    init : function() {

        socket = io.connect('http://' + location.hostname);

        //Login
        $('form').on('submit', function(e){
            e.preventDefault();
            var username = $('#nickname').val();
            App.username = username;
            $('#username').text(username);
            socket.emit('login',{
                'username' : username
            });
        });

        socket.on('login', function(){
            App.loggedIn = App.username;
            $('form').hide();
        });

        //Logged in
        socket.on('song', function(song){
            if (!App.loggedIn) {
                return;
            }
            App.onSong(song);
        });

        socket.on('right', function(data){
            if (!App.loggedIn) {
                return;
            }
            if (data) {
                App.onWrong();
            } else {
                App.onRight();
            }
        });

        socket.on('wrong', function(){
            if (!App.loggedIn) {
                return;
            }
            App.onWrong();
        });

        socket.on('refused', function(){
            alert("Connexion refusée");
        });

        //Suggestions
        $('#suggestions').on('click', function(e){
            if ($(e.target).attr('data-value')) {
                var value = $(e.target).attr('data-value');
                socket.emit('button',{
                    button: value
                });
            }
        });
    },

    onSong : function(song) {
        App.currentSong = song.song;
        App.showSuggestions();
    },

    onRight : function() {
        $('#suggestions').html("<span class='right'>✔</span>");
    },

    onWrong : function() {
        //@TODO: prevent from sending again
        $('#suggestions').html("<span class='wrong'>✖</span>");
    },

    showSuggestions : function() {
        var out = '';
        for (var i=0,l=App.currentSong.suggestions.length; i<l; i++) {
            out += '<li data-value="' + i + '">' + App.currentSong.suggestions[i].name + '</li>';
        }
        $('#suggestions').html(out);
    }
}
$(function(){
    App.init();
});
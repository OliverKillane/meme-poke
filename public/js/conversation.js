var socket = null;
var partnerName = ""

var myMessagesTop = '<div class="ui visible message self"> <div class="content">'

var partnerMessagesTop = '<div class="ui visible message partner"> <div class="content">'

$(document).ready(function(){
	$('#textBox').keyup(function(e){
		if(e.keyCode == 13)
		{
			$(this).trigger("enterKey");
		}
	});

	function scrollToBottom() {
		$("#messages").scrollTop($("#messages")[0].scrollHeight);
	}

	$('#textBox').bind("enterKey",function(e){
		var text = $("#textBox").val();
		$("#textBox").val("");
		$("#messages").append(myMessagesTop + text + '</div> </div>');
		socket.emit("newMessage", text);
		scrollToBottom();
	});

	$("button").on("click", function(){
		if(socket) {
			socket.disconnect();
		}
		socket = io({ query: "username=<%= username %>"});
		$("#waiting").removeClass("invisible");
		$("#disconnectedForm").addClass("invisible");
		$("h3").addClass("invisible");

		socket.on("newMessage", function(msg){
			$("#messages").append(partnerMessagesTop + msg + '</div> </div>');
			scrollToBottom();
		});

		socket.on("partnerDisconnect", function(){
			$("#disconnectedForm").removeClass("invisible");
			$(".ui.form").removeClass("invisible");
			$("h3").addClass("invisible");
			socket.disconnect();
		});

		socket.on("start", function(flags){
			$("#messageBoard").removeClass("invisible");
			console.log(flags);
			partnerName = flags.partnerName;
			$("#name").text(partnerName);
			$("#waiting").addClass("invisible");
			$(".ui.form").addClass("invisible");
			$("#messages").html("");
			$("h3").removeClass("invisible");
		});
	});
});
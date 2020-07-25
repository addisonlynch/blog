$(document).ready(function(){

    $('copy-btn').tooltip({
        trigger: 'click',
        placement: 'bottom'
    });

    function setTooltip(btn, message) {
        $(btn).tooltip('hide')
          .attr('data-original-title', message)
          .tooltip('show');
      }
      
      function hideTooltip(btn) {
        setTimeout(function() {
          $(btn).tooltip('hide');
        }, 1000);
      }
      

    var url = document.location.href;
    var clipboard = new ClipboardJS('.copy-btn', {
        text: function() {
          return url;
        }
      });

    clipboard.on('success', function(e) {
    setTooltip(e.trigger, 'Copied!');
    hideTooltip(e.trigger);
    });
    
    clipboard.on('error', function(e) {
    setTooltip(e.trigger, 'Failed!');
    hideTooltip(e.trigger);
    });
      
})
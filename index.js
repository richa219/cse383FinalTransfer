$('.collapses').on('show.bs.collapse','.collapse', function() {
    $('.collapses').find('.collapse.show').each(function() {
        $(this).toggleClass('show');
    });
});
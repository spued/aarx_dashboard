var ne_table = null;

window.addEventListener('load', function() {
    console.log('All assets are loaded');
    ne_table = $('#ne_table').DataTable(
        {
            processing: true,
            serverSide: false,
            ajax: {
                url: '/list_ne',
                type: 'POST',
            },
            columns: [
                { data: 'NE_Name' },
                { data: 'ne_count' }
            ],
        }
    );
    
});
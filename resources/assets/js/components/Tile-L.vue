<template>
    <div class="col-md-6 tile dashboard-element">
        <div class="title">{{title}}</div>
    </div>
</template>
<script>
    export default {
        created() {
            console.log('Component mounted.')
        },
        mounted() {
            console.log('Component mounted.')
            this.id = this._uid;
            console.log('Component id =' + this.id);
        },
        props: ['title'],
        data: function () {
            return {
                properties: {
                    title: ''
                },
            }
        },
    }
</script>

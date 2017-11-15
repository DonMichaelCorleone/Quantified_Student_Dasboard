<template>
    <div class="col tile dashboard-element">
        <div class="title">{{title}}</div>
        <div  class="panelBody" v-bind:id="'panel_' + this._uid"></div>
    </div>
</template>
<script>
    export default {
        created() {
            console.log('Component mounted.')
        },
        mounted() {
            this.id = this._uid;
            console.log(this.$root.$data)

        },
        props: ['title', 'panelId'],
        data: function () {
            return {
                properties: {
                    title: '',
                    panelId: ''
                },
            }
        },
    }
</script>

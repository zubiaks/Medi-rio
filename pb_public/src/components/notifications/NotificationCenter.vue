<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { loadAppNotifications, markAllNotificationsRead, markNotificationRead, unreadNotifications, type AppNotification } from "@/domain/notifications/notifications";
const auth=useAuth(); const router=useRouter();
const open=ref(false); const loading=ref(false); const items=ref<AppNotification[]>([]);
const unread=computed(()=>unreadNotifications(items.value));
async function load(){loading.value=true;try{items.value=await loadAppNotifications(auth.user.value?.role);}finally{loading.value=false;}}
async function select(item:AppNotification){markNotificationRead(item.id);item.read=true;open.value=false;await router.push(item.to);}
function readAll(){markAllNotificationsRead(items.value);items.value=items.value.map(item=>({...item,read:true}));}
onMounted(load);
</script>
<template><div class="notification-center"><button class="button button-secondary notification-trigger" type="button" :aria-expanded="open" aria-haspopup="dialog" @click="open=!open; if(open) load()">Notificações <span v-if="unread" aria-label="não lidas">{{unread}}</span></button><section v-if="open" class="notification-popover" role="dialog" aria-label="Centro de notificações"><header><h2>Notificações</h2><button class="icon-button" type="button" aria-label="Fechar" @click="open=false">×</button></header><div class="form-actions"><button class="button button-secondary" type="button" :disabled="loading" @click="load">Atualizar</button><button class="button button-secondary" type="button" :disabled="!unread" @click="readAll">Marcar todas como lidas</button></div><p v-if="loading">A carregar…</p><p v-else-if="!items.length">Não existem notificações.</p><ul v-else><li v-for="item in items" :key="item.id" :class="[`is-${item.severity}`,{'is-read':item.read}]"><button type="button" @click="select(item)"><strong>{{item.title}}</strong><span>{{item.message}}</span><small>{{new Date(item.createdAt).toLocaleString('pt-PT')}}</small></button></li></ul></section></div></template>

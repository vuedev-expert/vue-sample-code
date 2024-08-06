<script lang="ts" setup>
import MainHeader from '../components/MainHeader.vue'
import { RouteNames } from '@/core/models/app-router.model'
import { ref, onMounted, watch } from 'vue'
import {useRoute, useRouter} from 'vue-router'
import { organisationSettingsMenu, supportAdminLinks } from '../models/menu.model'
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store/use-auth-store";
import {useReportStore} from "@/store/use-report-store";
import LegislationUpdateAlertOnLogin from "@/views/main/legislation/components/LegislationUpdateAlertOnLogin.vue";
import {useLegislationLibrary} from "@/store/use-legislation-store";

const reportStore = useReportStore()
const authStore = useAuthStore()
const router = useRouter()
const legsilationStore = useLegislationLibrary()
const { isSupportAdmin, isSuperAdmin, isManager } = storeToRefs(authStore)
const { countsKey } = storeToRefs(reportStore)
const { updatedLegislationsForAlert, alertCount } = storeToRefs(legsilationStore)

const menu = ref([...organisationSettingsMenu])

const route = useRoute()
const isSubMenuExpanded = ref(false)
const count = ref(0)
const legislationAlert = ref<{ isUpdateModalShown: boolean } | null>(null)

onMounted(async () => {
  await legsilationStore.getUpdatedLegislationList()
})


watch(() => updatedLegislationsForAlert.value, () => {
  console.log('check count condition ', alertCount.value, alertCount.value.every((item :number) => item >= 4))
  if (legislationAlert.value) {
    if (alertCount.value.every((item :number) => item >= 4)) {
        localStorage.setItem('hide-alert', 'true')  // hide alert box case
        legislationAlert.value.isUpdateModalShown = false
    } else {
      if (localStorage.getItem('hide-alert') != 'true')
        legislationAlert.value.isUpdateModalShown = true  // showing alert box if user goes with Remind me later case
    }
  }
})

const routeCheck = (name :string) => route.name === name ? componentKey.value++ : null

const removeFilters = (name :string, regularRoute = true) => {
  if (regularRoute) routeCheck(name)
  else countsKey.value = count.value++
  if (localStorage.getItem('filterOptions')) localStorage.removeItem('filterOptions')
}

const componentKey = ref(0);
const togglerOff = ref(true)

const hideSidebar = (event :any) => {
  let sidebar
  if (isSupportAdmin.value) sidebar = document.getElementById('sideBarAdmin')
  else sidebar = document.getElementById('sideBar')
  if (sidebar && !sidebar.contains(event.target) && sidebar.classList.contains('show')) {
    sidebar.classList.remove('show')
    sidebar.classList.add('hidden')
  }
}

const stickSidebar = () => {
  let sidebar = document.getElementById('sideBar')
  if (sidebar) {
    if (togglerOff.value) sidebar.classList.add('stick')
    else sidebar.classList.remove('stick')
  }
  togglerOff.value = !togglerOff.value
}


const legislationRoutes = [RouteNames.LEGISLATION_LIBRARY_HOME, RouteNames.SUBSCRIBED_ITEMS, RouteNames.LEGISLATION_UPDATES, RouteNames.LEGAL_REGISTER]
</script>

<template>
  <div class="flex flex-col">
    <MainHeader></MainHeader>
    <div class="flex-1 bg-base-background overflow-hidden">
      <section class="h-full">
        <div class="dashboard-container" @click="hideSidebar">
          <!-- Support Admin's sidebar -->
          <div v-if="isSupportAdmin" id="sideBarAdmin" class="sidebar admin hidden md:flex min-h-[86vh]">
            <div class="sidebar-toggler top-0 right-4 hidden md:block">
              <font-awesome-icon v-if="togglerOff" id="stickSidebar" @click="stickSidebar" icon="fa-regular fa-circle" class="text-primary-500" size="lg" />
              <font-awesome-icon v-else id="unStickSidebar" @click="stickSidebar" icon="fa-regular fa-circle-dot" class="text-primary-500" size="lg" />
            </div>

            <router-link
                v-for="link in supportAdminLinks"
                :id="link.id"
                :key="link.id"
                :to="{ name: link.path }"
                class="sidbar-item"
                :class="{ active: route.name === link.path }"
            >
              <font-awesome-icon :icon="link.icon" />
              <span class="text">{{ link.label }}</span>
            </router-link>
          </div>

          <!-- Customer's sidebar -->
          <div v-else id="sideBar" class="sidebar hidden md:flex min-h-[86vh]" @mouseleave="togglerOff ? isSubMenuExpanded = !togglerOff : null">
            <div class="sidebar-toggler top-0 right-4 hidden md:block">
              <img v-if="togglerOff" id="stickSidebar" @click="stickSidebar" src="@/assets/imgs/pin.svg" alt="pin">
              <font-awesome-icon v-else id="unStickSidebar" @click="stickSidebar" icon="arrow-left-long" class="text-primary-500" size="xl" />
            </div>

            <router-link
                v-if="isSuperAdmin || isManager"
                id="dashboardView"
                :to="{ name: RouteNames.DASHBOARD }"
                class="sidbar-item"
                :class="{ active: route.name === RouteNames.DASHBOARD }"
                @click="routeCheck(RouteNames.DASHBOARD)"
            >
              <font-awesome-icon icon="dashboard" />
              <span class="text">Dashboard</span>
            </router-link>

            <router-link
                id="legislationView"
                :to="{ name: RouteNames.LEGISLATION_LIBRARY }"
                class="sidbar-item"
                :class="{ active: legislationRoutes.includes(route.name) }"
                @click="removeFilters(RouteNames.LEGISLATION_LIBRARY)"
            >
              <font-awesome-icon icon="users" />
              <span class="text">Legislation Library</span>
            </router-link>

            <router-link
                id="risksView"
                :to="{ name: RouteNames.RISK_MANAGEMENT }"
                class="sidbar-item"
                :class="{ active: route.name === RouteNames.RISK_MANAGEMENT }"
                @click="removeFilters(RouteNames.RISK_MANAGEMENT)"
            >
              <font-awesome-icon icon="clipboard-list" />
              <span class="text">Risk Register</span>
            </router-link>

            <router-link
                id="issuesView"
                :to="{ name: RouteNames.ISSUE_MANAGEMENT }"
                class="sidbar-item"
                :class="{ active: route.name === RouteNames.ISSUE_MANAGEMENT }"
                @click="removeFilters(RouteNames.ISSUE_MANAGEMENT)"
            >
              <font-awesome-icon icon="circle-exclamation" />
              <span class="text">Issue Management</span>
            </router-link>

            <router-link
                id="actionsView"
                :to="{ name: RouteNames.ACTION_MANAGEMENT }"
                class="sidbar-item"
                :class="{ active: route.name === RouteNames.ACTION_MANAGEMENT }"
                @click="removeFilters(RouteNames.ACTION_MANAGEMENT)"
            >
              <font-awesome-icon icon="gear" />
              <span class="text">Action Center</span>
            </router-link>

            <router-link
                id="reportsView"
                :to="{ name: RouteNames.EXPORT_REPORT }"
                class="sidbar-item"
                :class="{ active: route.name === RouteNames.EXPORT_REPORT }"
                @click="removeFilters(RouteNames.EXPORT_REPORT, false)"
            >
              <font-awesome-icon icon="file-lines" />
              <span class="text">Report</span>
            </router-link>
            <a
                v-if="isSuperAdmin"
                id="organizationSettings"
                class="sidbar-item sub-menu !pr-5"
                @click="isSubMenuExpanded = !isSubMenuExpanded"
            >
              <font-awesome-icon icon="gear" class="pt-1" />
              <span class="text menu-label">Organization Settings</span>
              <font-awesome-icon v-if="!!isSubMenuExpanded" icon="angle-down" />
              <font-awesome-icon v-else icon="angle-right" class="dropdown-arrow" />
            </a>
            <ul v-if="isSubMenuExpanded">
              <li v-for="child in menu[0].children" :key="child.label">
                <router-link
                    :id="child.id"
                    class="org-menu-item sub-item"
                    :to="{ name: child.routeName }"
                    @click="removeFilters"
                >{{ child.label }}
                </router-link>
              </li>
            </ul>
          </div>

          <div class="content p-4 md:p-[2.4rem] h-full hover:shrunk" style="max-width: 100%; overflow: auto">
            <router-view :key="componentKey"></router-view>
          </div>
        </div>
      </section>
    </div>
  </div>

  <LegislationUpdateAlertOnLogin
    ref="legislationAlert"
    :legislations="updatedLegislationsForAlert"
  />
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Bebas+Neue&family=Cabin:wght@400;500;600;700&family=DM+Sans:wght@400;500;700&family=Hind:wght@400;500;600;700&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Lato:wght@400;700;900&family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Noto+Sans+JP:wght@100;300;400;500;700;900&family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100&family=Quicksand:wght@300;400;500;600;700&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Satisfy&family=Source+Sans+Pro&family=Spectral:wght@200;300;400;500;600;700;800&display=swap');
</style>

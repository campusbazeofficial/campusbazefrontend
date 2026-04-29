<!-- src/views/Services.vue -->
<template>
  <div class="min-h-screen bg-cb-base">
    <!-- Header -->
    <section class="bg-cb-card rounded-md">
      <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="mb-2 inline-flex items-center gap-1.5 rounded-full bg-cb-base px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cb-muted">
              <i class="fa-solid fa-store text-[9px]"></i>
              Marketplace
            </div>
            <h1 class="text-xl font-bold tracking-tight text-cb-text sm:text-2xl lg:text-3xl">Services</h1>
            <p class="mt-1 text-sm text-cb-muted">Find talented people to get your work done.</p>
          </div>
          <router-link
            :to="{ name: 'CreateService' }"
            class="inline-flex items-center justify-center gap-2 self-start whitespace-nowrap rounded-xl bg-cb-accent px-4 py-2.5 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark hover:shadow-lg hover:shadow-cb-accent/30 sm:px-5 sm:py-3"
          >
            <i class="fa-solid fa-plus text-xs"></i>
            <span class="hidden sm:inline">Create Service</span>
            <span class="sm:hidden">Create</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Filters & Search -->
    <div class="sticky -top-10 z-30 bg-cb-base">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">

          <!-- Left: filters + view toggle -->
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="flex items-center gap-2 min-w-0 overflow-hidden">
              <DropDown
                ref="categoryDropdown"
                class="shrink min-w-0"
                bgClass="bg-cb-field"
                :label="filters.category ? categoryLabels[filters.category] || filters.category : 'All Categories'"
                :min-width="200"
              >
                <div class="py-1">
                  <button
                    v-for="opt in categoryOptions"
                    :key="opt.value"
                    @click="setCategory(opt.value)"
                    :class="['flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors', filters.category === opt.value ? 'bg-cb-accent-subtle text-cb-accent font-semibold' : 'text-cb-text hover:bg-cb-field']"
                  >
                    <i v-if="filters.category === opt.value" class="fa-solid fa-check text-[10px]"></i>
                    <span :class="filters.category !== opt.value ? 'ml-[18px]' : ''">{{ opt.label }}</span>
                  </button>
                </div>
              </DropDown>

              <DropDown
                ref="sortDropdown"
                class="shrink min-w-0"
                bgClass="bg-cb-field"
                :label="sortOptions.find((s) => s.value === filters.sort)?.label || 'Sort'"
                :min-width="180"
              >
                <div class="py-1">
                  <button
                    v-for="opt in sortOptions"
                    :key="opt.value"
                    @click="setSort(opt.value)"
                    :class="['flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors', filters.sort === opt.value ? 'bg-cb-accent-subtle text-cb-accent font-semibold' : 'text-cb-text hover:bg-cb-field']"
                  >
                    <i v-if="filters.sort === opt.value" class="fa-solid fa-check text-[10px]"></i>
                    <span :class="filters.sort !== opt.value ? 'ml-[18px]' : ''">{{ opt.label }}</span>
                  </button>
                </div>
              </DropDown>
            </div>

            <!-- View toggle -->
            <div class="hidden sm:flex shrink-0 rounded-xl border border-cb-divider bg-cb-card p-1">
              <button
                @click="viewMode = 'grid'"
                :class="['rounded-lg px-2.5 py-1.5 text-sm transition-colors', viewMode === 'grid' ? 'bg-cb-accent text-cb-contrast' : 'text-cb-muted hover:text-cb-text']"
                title="Grid view"
              >
                <i class="fa-solid fa-grip"></i>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="['rounded-lg px-2.5 py-1.5 text-sm transition-colors', viewMode === 'list' ? 'bg-cb-accent text-cb-contrast' : 'text-cb-muted hover:text-cb-text']"
                title="List view"
              >
                <i class="fa-solid fa-list"></i>
              </button>
            </div>
          </div>

          <!-- Search -->
          <div class="relative w-full sm:flex-1 bg-cb-card rounded-xl border border-cb-divider">
            <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cb-muted pointer-events-none"></i>
            <input
              v-model="filters.search"
              type="search"
              placeholder="Search services..."
              class="w-full rounded-xl bg-transparent py-2 pl-9 pr-4 text-sm text-cb-text placeholder:text-cb-muted-40 focus:outline-none"
              @input="debouncedFetch"
            />
          </div>
        </div>

        <!-- Active filter pills -->
        <div v-if="filters.category || (filters.search && filters.search.trim().length > 0)" class="mt-3 flex flex-wrap items-center gap-2">
          <span class="text-xs text-cb-muted">Filters:</span>
          <button v-if="filters.category" @click="clearFilter('category')" class="inline-flex items-center gap-1.5 rounded-full border border-cb-divider bg-cb-card px-2.5 py-1 text-xs text-cb-text hover:bg-cb-field">
            {{ categoryLabels[filters.category] || filters.category }}
            <i class="fa-solid fa-times text-[10px] text-cb-muted"></i>
          </button>
          <button v-if="filters.search && filters.search.trim().length > 0" @click="clearFilter('search')" class="inline-flex items-center gap-1.5 rounded-full border border-cb-divider bg-cb-card px-2.5 py-1 text-xs text-cb-text hover:bg-cb-field">
            "{{ filters.search }}"
            <i class="fa-solid fa-times text-[10px] text-cb-muted"></i>
          </button>
          <button @click="clearAllFilters" class="text-xs text-cb-muted hover:text-cb-text underline underline-offset-2">Clear all</button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="mx-auto max-w-7xl pb-10">
      <div v-if="!loading && services.length" class="mb-3 text-xs text-cb-muted">
        {{ meta?.total ?? services.length }} service{{ (meta?.total ?? services.length) !== 1 ? 's' : '' }} found
      </div>

      <!-- Loading -->
      <div v-if="loading" :class="viewMode === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'">
        <SkeletonCard v-for="i in 6" :key="i" />
      </div>

      <!-- Empty -->
      <EmptyState
        v-else-if="!services.length"
        icon="fa-solid fa-store-slash"
        title="No services found"
        description="Try adjusting your filters or search term."
      />

      <!-- Grid / List -->
      <div v-else>
        <div :class="viewMode === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'">
          <ServiceCard
            v-for="service in services"
            :key="service._id"
            :service="service"
            :view-mode="viewMode"
            :is-own-service="isOwnService(service)"
            :active-order="getOrderForService(service)"
            @click="openDetail(service._id)"
            @view="openDetail(service._id)"
          />
        </div>

        <div v-if="meta && meta.totalPages > 1" class="mt-8">
          <Pagination
            :current-page="currentPage"
            :total-pages="meta.totalPages"
            @page="goToPage"
          />
        </div>
      </div>
    </div>

    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useServiceStore } from "@/stores/serviceStore";
import { useUserStore } from "@/stores/userStore";
import { useToast } from "@/composables/useToast";
import { debounce } from "@/utils/debounce";
import ServiceCard from "@/components/services/ServiceCard.vue";
import Pagination from "@/components/reusables/Pagination.vue";
import EmptyState from "@/components/reusables/EmptyState.vue";
import SkeletonCard from "@/components/errands/SkeletonCard.vue";
import ToastContainer from "@/components/reusables/ToastContainer.vue";
import DropDown from "@/components/reusables/DropDownComponent.vue";

const serviceStore = useServiceStore();
const userStore = useUserStore();
const toast = useToast();
const router = useRouter();

const categoryDropdown = ref(null);
const sortDropdown = ref(null);
const viewMode = ref("grid");

const filters = ref({
  category: "",
  sort: "-createdAt",
  search: "",
  page: 1,
  limit: 12,
});

const categoryLabels = {
  graphic_design: "Graphic Design", content_writing: "Content Writing",
  programming: "Programming", web_dev: "Web Development",
  tutoring: "Tutoring", video_production: "Video Production",
  digital_marketing: "Digital Marketing", music_audio: "Music & Audio",
  legal: "Legal", engineering: "Engineering", translation: "Translation",
  consulting: "Consulting", data_analytics: "Data Analytics", other: "Other",
};

const categoryOptions = [
  { value: "", label: "All Categories" },
  ...Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
];

const sortOptions = [
  { value: "-createdAt", label: "Newest" },
  { value: "averageRating", label: "Highest Rated" },
  { value: "totalOrders", label: "Most Popular" },
  { value: "tiers.price", label: "Price: Low → High" },
  { value: "-tiers.price", label: "Price: High → Low" },
];

function setCategory(value) {
  filters.value.category = value;
  filters.value.page = 1;
  categoryDropdown.value?.close();
  fetchServices();
}

function setSort(value) {
  filters.value.sort = value;
  filters.value.page = 1;
  sortDropdown.value?.close();
  fetchServices();
}

const services = computed(() => serviceStore.marketplace);
const meta = computed(() => serviceStore.marketplaceMeta);
const loading = computed(() => serviceStore.loading);
const currentPage = computed(() => filters.value.page);

// Active order map (by listingId) for card indicators
const activeOrderMap = computed(() => {
  const map = new Map();
  const activeStatuses = ["pending_payment", "in_progress", "delivered", "revision"];
  serviceStore.buyingOrders
    .filter((o) => activeStatuses.includes(o.status))
    .forEach((o) => {
      const listingId = typeof o.listingId === "object" ? o.listingId?._id : o.listingId;
      if (listingId) map.set(listingId, o);
    });
  return map;
});

function getOrderForService(service) {
  if (!userStore.user) return null;
  return activeOrderMap.value.get(service._id) ?? null;
}

function isOwnService(service) {
  if (!userStore.user) return false;
  const sellerId = typeof service.sellerId === "object" ? service.sellerId?._id : service.sellerId;
  return sellerId === userStore.user._id;
}

async function fetchServices() {
  try {
    await serviceStore.fetchMarketplace(filters.value);
  } catch {
    toast.error("Failed to load services");
  }
}

const debouncedFetch = debounce(fetchServices, 400);

function goToPage(page) {
  filters.value.page = page;
  fetchServices();
}

function clearFilter(key) {
  filters.value[key] = "";
  filters.value.page = 1;
  fetchServices();
}

function clearAllFilters() {
  filters.value.category = "";
  filters.value.search = "";
  filters.value.page = 1;
  fetchServices();
}

// ── Navigate to detail page ───────────────────────────────────
function openDetail(serviceId) {
  router.push({ name: "ServiceDetail", params: { id: serviceId } });
}

onMounted(() => {
  fetchServices();
  serviceStore.fetchBuyingOrders();
});
</script>
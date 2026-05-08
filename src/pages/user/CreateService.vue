<!-- src/pages/user/CreateService.vue -->
<template>
  <div class="min-h-screen bg-cb-base">
    <!-- ── Header ─────────────────────────────────────────────────── -->
    <header class="bg-cb-card rounded-md">
      <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 ">
        <div
          class="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cb-divider bg-cb-base px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cb-muted"
        >
          <i class="fa-solid fa-briefcase text-[9px]"></i>
          Services
        </div>
        <h1
          class="text-xl font-bold tracking-tight text-cb-text sm:text-2xl lg:text-3xl"
        >
          {{ isEditMode ? "Edit Service" : "Create a New Service" }}
        </h1>
        <p class="mt-1 text-sm text-cb-muted">
          {{
            isEditMode
              ? "Update your service listing details."
              : "Offer your skills and get hired by clients."
          }}
        </p>
      </div>
    </header>

    <!-- ── Sticky section nav with balance info ─────────────────────── -->
    <nav class="sticky -top-8 z-20 border-b border-cb-divider bg-cb-base/95 backdrop-blur-sm">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <!-- Section navigation buttons -->
          <div
            class="flex items-center gap-1 overflow-x-auto scrollbar-hide"
          >
            <button
              v-for="(step, i) in formSteps"
              :key="step.id"
              type="button"
              @click="scrollToSection(step.id)"
              :class="[
                'flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150',
                activeSection === step.id
                  ? 'bg-cb-accent-subtle text-cb-accent'
                  : 'text-cb-muted hover:bg-cb-field hover:text-cb-text',
              ]"
            >
              <span
                :class="[
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold leading-none transition-colors',
                  activeSection === step.id
                    ? 'bg-cb-accent text-cb-contrast'
                    : 'bg-cb-field text-cb-muted',
                ]"
                >{{ i + 1 }}</span
              >
              <span>{{ step.label }}</span>
            </button>
          </div>

          <!-- Wallet info card -->
          <div class="flex items-center gap-4 rounded-xl border border-cb-divider bg-cb-card p-2 px-4 shadow-sm">
            <div class="flex flex-col border-r border-cb-divider pr-4">
              <span class="text-[8px] font-bold uppercase text-cb-muted">Balance</span>
              <span :class="['text-xs font-bold', walletStore.cbcBalance > 0 ? 'text-cb-positive' : 'text-cb-negative']">
                {{ walletStore.cbcBalance.toLocaleString() }} CBC
              </span>
            </div>
            <div class="flex flex-col border-r border-cb-divider pr-4">
              <span class="text-[8px] font-bold uppercase text-cb-muted">Buyer CBC Fee</span>
              <span class="text-xs font-bold text-cb-accent">{{ servicePostingCost }} CBC</span>
            </div>
           <div class="flex max-w-[150px] flex-col">
              <span class="text-[8px] font-bold uppercase text-cb-muted">Notice</span>
              <span class="text-[9px] leading-tight text-cb-text italic">CBC deducted from buyers when they order your service.</span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- ── Form body ────────────────────────────────────────────────── -->
    <div class="mx-auto max-w-7xl py-6">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- ① Basic Information ──────────────────────────────────── -->
        <section
          id="section-basic"
          class="scroll-mt-[72px] overflow-hidden rounded-2xl bg-cb-card"
        >
          <!-- Section header -->
          <div
            class="flex items-center gap-3 bg-cb-base/50 px-5 py-3.5 sm:px-6"
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cb-accent text-[10px] font-extrabold text-cb-contrast"
              >1</span
            >
            <h2 class="text-sm font-bold text-cb-text">Basic Information</h2>
          </div>

          <div class="space-y-5 p-5 sm:p-6">
            <!-- Title -->
            <div>
              <label
                class="mb-1.5 flex items-center justify-between text-sm font-semibold text-cb-text"
              >
                <span
                  >Service Title <span class="text-cb-negative">*</span></span
                >
                <span class="text-xs font-normal text-cb-muted"
                  >{{ form.title.length }}/100</span
                >
              </label>
              <div class="bg-cb-field rounded-md">
                <input
                  v-model.trim="form.title"
                  type="text"
                  maxlength="100"
                  placeholder="e.g., Professional Logo Design"
                  :class="[
                    'w-full rounded-xl border-2 px-4 py-3 text-sm text-cb-text outline-none transition-colors placeholder:text-cb-muted-40',
                    errors.title
                      ? 'border-cb-negative/50 bg-cb-negative-subtle'
                      : 'border-cb-divider focus:border-cb-accent',
                  ]"
                  @input="clearFieldError('title')"
                />
              </div>
              <p v-if="errors.title" class="mt-1.5 flex items-center gap-1.5 text-xs text-cb-negative animate-pulse">
                <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                {{ errors.title }}
              </p>
            </div>

          <!-- Category -->
<div>
  <label class="mb-1.5 block text-sm font-semibold text-cb-text">
    Category <span class="text-cb-negative">*</span>
  </label>

  <div class="rounded-xl px-2 py-1 focus-within:border-cb-accent">
    <AppDropdown
      ref="categoryDropdownRef"
      :label="selectedCategoryLabel"
      :min-width="240"
      @close="clearFieldError('category')"
    >
      <div class="py-1 max-h-64 overflow-y-auto">
        <button
          v-for="opt in categoryOptions"
          :key="opt.value"
          type="button"
          @click="selectCategory(opt.value)"
          :class="[
            'flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left',
            form.category === opt.value
              ? 'bg-cb-accent-subtle font-semibold text-cb-accent'
              : 'text-cb-text hover:bg-cb-field',
          ]"
        >
          <i
            :class="[
              opt.icon,
              'w-4 shrink-0 text-center text-[11px]',
              form.category === opt.value
                ? 'text-cb-accent'
                : 'text-cb-muted',
            ]"
          ></i>
          <span class="flex-1">{{ opt.label }}</span>
          <i
            v-if="form.category === opt.value"
            class="fa-solid fa-check text-[10px] text-cb-accent"
          ></i>
        </button>
      </div>
    </AppDropdown>
  </div>

  <!-- Custom category input (shown when "Other" is selected) -->
  <div v-if="form.category === 'other'" class="mt-3">
    <div class="bg-cb-field rounded-md">
      <input
        v-model.trim="customCategory"
        type="text"
        maxlength="50"
        placeholder="Type your category (e.g., Photography, Event Planning)"
        :class="[
          'w-full rounded-xl border-2 px-4 py-3 text-sm text-cb-text outline-none transition-colors placeholder:text-cb-muted-40',
          customCategoryError
            ? 'border-cb-negative/50 bg-cb-negative-subtle'
            : 'border-cb-divider focus:border-cb-accent',
        ]"
        @input="customCategoryError = ''; clearFieldError('category')"
      />
    </div>
    <p v-if="customCategoryError" class="mt-1.5 flex items-center gap-1.5 text-xs text-cb-negative animate-pulse">
      <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
      {{ customCategoryError }}
    </p>
  </div>

  <p v-if="errors.category" class="mt-1.5 flex items-center gap-1.5 text-xs text-cb-negative animate-pulse">
    <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
    {{ errors.category }}
  </p>
</div>

            <!-- Description -->
            <div>
              <label
                class="mb-1.5 flex items-center justify-between text-sm font-semibold text-cb-text"
              >
                <span>Description <span class="text-cb-negative">*</span></span>
                <span class="text-xs font-normal text-cb-muted"
                  >{{ form.description.length }}/1000</span
                >
              </label>
              <textarea
                v-model.trim="form.description"
                rows="5"
                maxlength="1000"
                placeholder="Describe your service in detail. What do you offer? What makes you unique?"
                :class="[
                  'w-full resize-none rounded-xl border-2 bg-cb-base px-4 py-3 text-sm text-cb-text outline-none transition-colors placeholder:text-cb-muted-40',
                  errors.description
                    ? 'border-cb-negative/50 bg-cb-negative-subtle'
                    : 'border-cb-divider focus:border-cb-accent',
                ]"
                @input="clearFieldError('description')"
              ></textarea>
              <p
                v-if="errors.description"
                class="mt-1.5 flex items-center gap-1.5 text-xs text-cb-negative animate-pulse"
              >
                <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                {{ errors.description }}
              </p>
            </div>
          </div>
        </section>

        <!-- ② Pricing Tiers ──────────────────────────────────────── -->
        <section
          id="section-pricing"
          class="scroll-mt-[72px] overflow-hidden rounded-2xl  bg-cb-card"
        >
          <div
            class="flex items-center justify-between gap-3 border-b border-cb-divider bg-cb-base/50 px-5 py-3.5 sm:px-6"
          >
            <div class="flex items-center gap-3">
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cb-accent text-[10px] font-extrabold text-cb-contrast"
                >2</span
              >
              <h2 class="text-sm font-bold text-cb-text">Pricing Tiers</h2>
              <span
                v-if="form.tiers.length"
                class="rounded-full bg-cb-field px-2 py-0.5 text-[10px] font-bold text-cb-muted"
              >
                {{ form.tiers.length }}
              </span>
            </div>
            <button
              v-if="form.tiers.length < 3"
              type="button"
              @click="addTier"
              class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-cb-accent/30 bg-cb-accent-subtle px-3 py-1.5 text-xs font-semibold text-cb-accent transition-colors hover:bg-cb-accent/10 active:scale-95"
            >
              <i class="fa-solid fa-plus text-[9px]"></i>
              <span class="hidden sm:inline">Add Tier</span>
              <span class="sm:hidden">Add</span>
            </button>
          </div>

          <div class="p-5 sm:p-6">
            <!-- Tier error -->
            <div
              v-if="errors.tiers"
              class="mb-4 flex items-center gap-2 rounded-xl border border-cb-negative/20 bg-cb-negative-subtle px-3 py-2.5 text-xs font-medium text-cb-negative animate-pulse"
            >
              <i class="fa-solid fa-circle-exclamation shrink-0"></i>
              {{ errors.tiers }}
            </div>

            <!-- Empty state -->
            <div
              v-if="form.tiers.length === 0"
              class="flex flex-col items-center justify-center rounded-xl border border-dashed border-cb-divider bg-cb-base px-6 py-10 text-center"
            >
              <span
                class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cb-field"
              >
                <i class="fa-solid fa-layer-group text-lg text-cb-muted-40"></i>
              </span>
              <p class="text-sm font-medium text-cb-muted">No tiers yet</p>
              <p class="mt-0.5 text-xs text-cb-muted-40">
                Add at least one pricing tier to offer your service.
              </p>
              <button
                type="button"
                @click="addTier"
                class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-cb-accent px-4 py-2 text-xs font-semibold text-cb-contrast transition-colors hover:bg-cb-accent-dark"
              >
                <i class="fa-solid fa-plus text-[9px]"></i>
                Add First Tier
              </button>
            </div>

            <!-- Tier cards -->
            <div v-else class="space-y-4">
              <div
                v-for="(tier, index) in form.tiers"
                :key="index"
                class="overflow-hidden rounded-xl border border-cb-divider bg-cb-base"
              >
                <!-- Tier card header -->
                <div
                  :class="[
                    'flex items-center justify-between gap-2 border-b border-cb-divider px-4 py-3',
                    index === 0
                      ? 'bg-cb-field/40'
                      : index === 1
                        ? 'bg-cb-warning-subtle/30'
                        : 'bg-cb-accent-subtle/30',
                  ]"
                >
                  <div class="flex min-w-0 items-center gap-2">
                    <span
                      :class="[
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                        index === 0
                          ? 'bg-cb-field text-cb-muted'
                          : index === 1
                            ? 'bg-cb-warning-subtle text-cb-warning'
                            : 'bg-cb-accent-subtle text-cb-accent',
                      ]"
                      >{{ index + 1 }}</span
                    >
                    <span
                      class="truncate text-xs font-bold capitalize text-cb-text"
                    >
                      {{ tier.name || `Tier ${index + 1}` }}
                    </span>
                    <span
                      v-if="tier.price"
                      class="shrink-0 rounded-full bg-cb-base px-2 py-0.5 text-[10px] font-semibold text-cb-muted ring-1 ring-cb-divider"
                    >
                      ₦{{ Number(tier.price).toLocaleString() }}
                    </span>
                    <span
                      v-if="tier.deliveryDays"
                      class="hidden shrink-0 text-[10px] text-cb-muted sm:inline"
                    >
                      · {{ tier.deliveryDays }}d delivery
                    </span>
                    <!-- Buyer CBC fee badge -->
                    <span
                      v-if="tierCbcFees[index]?.cbcFee > 0"
                      class="hidden shrink-0 items-center gap-1 rounded-full bg-cb-accent-subtle px-2 py-0.5 text-[10px] font-semibold text-cb-accent sm:inline-flex"
                      title="CBC fee buyers pay when ordering this tier"
                    >
                      {{ tierCbcFees[index].cbcFee }} CBC
                    </span>
                  </div>
                  <button
                    v-if="form.tiers.length > 1"
                    type="button"
                    @click="removeTier(index); clearFieldError('tiers')"
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-cb-muted transition-colors hover:bg-cb-negative-subtle hover:text-cb-negative"
                    title="Remove tier"
                  >
                    <i class="fa-solid fa-trash text-[11px]"></i>
                  </button>
                </div>

                <!-- Tier fields -->
                <div class="grid gap-4 p-4 sm:grid-cols-2">
                  <!-- Tier Name -->
                  <div>
                    <label
                      class="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-cb-muted"
                      >Tier Name</label
                    >
                    <AppDropdown
                      bgClass="bg-cb-accent-subtle/50"
                      textClass="text-cb-text"
                      :ref="
                        (el) => {
                          if (el) tierDropdownRefs[index] = el;
                        }
                      "
                      :label="
                        tierNameOptions.find((o) => o.value === tier.name)
                          ?.label ?? 'Select'
                      "
                      :min-width="160"
                    >
                      <div class="py-1">
                        <button
                          v-for="opt in tierNameOptions"
                          :key="opt.value"
                          type="button"
                          @click="
                            tier.name = opt.value;
                            tierDropdownRefs[index]?.close?.();
                            clearFieldError('tiers');
                          "
                          :class="[
                            'flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left',
                            tier.name === opt.value
                              ? 'bg-cb-accent-subtle font-semibold text-cb-accent'
                              : 'text-cb-text hover:bg-cb-field',
                          ]"
                        >
                          <i
                            :class="[
                              opt.icon,
                              'w-4 shrink-0 text-center text-[11px]',
                              tier.name === opt.value
                                ? 'text-cb-accent'
                                : 'text-cb-muted',
                            ]"
                          ></i>
                          <span class="flex-1">{{ opt.label }}</span>
                          <i
                            v-if="tier.name === opt.value"
                            class="fa-solid fa-check text-[10px] text-cb-accent"
                          ></i>
                        </button>
                      </div>
                    </AppDropdown>
                  </div>

                  <!-- Price -->
                  <div>
                    <label
                      class="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-cb-muted"
                      >Price (₦) <span class="text-cb-negative">*</span></label
                    >
                    <div class="relative">
                      <span
                        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-cb-muted"
                        >₦</span
                      >
                      <div class="bg-cb-field rounded-md">
                        <input
                          v-model.number="tier.price"
                          type="number"
                          min="0"
                          step="100"
                          placeholder="0"
                          :class="['w-full rounded-xl border bg-cb-field py-2.5 pl-8 pr-3 text-sm text-cb-text outline-none transition-colors focus:bg-cb-base', tier.price > 0 && tier.price < 500 ? 'border-cb-negative/60 focus:border-cb-negative' : 'border-cb-divider focus:border-cb-accent']"
                          @input="clearFieldError('tiers')"
                        />
                      </div>
                    </div>
                    <p v-if="tier.price > 0 && tier.price < 500" class="mt-1 flex items-center gap-1 text-[10px] font-semibold text-cb-negative">
                      <i class="fa-solid fa-circle-exclamation text-[9px]"></i>Minimum tier price is ₦500
                    </p>
                    <p v-else-if="tier.price >= 500 && tierCbcFees[index]?.cbcFee > 0" class="mt-1 text-[10px] text-cb-muted">
                      Buyer pays <strong class="text-cb-accent">{{ tierCbcFees[index].cbcFee }} CBC</strong> upfront when ordering
                    </p>
                  </div>

                  <!-- Delivery Days -->
                  <div>
                    <label
                      class="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-cb-muted"
                      >Delivery Time</label
                    >
                    <div class="relative">
                      <div class="bg-cb-field rounded-md">
                        <input
                          v-model.number="tier.deliveryDays"
                          type="number"
                          min="1"
                          placeholder="3"
                          class="w-full rounded-xl border border-cb-divider bg-cb-field px-3 py-2.5 pr-14 text-sm text-cb-text placeholder:text-cb-muted outline-none transition-colors focus:border-cb-accent focus:bg-cb-base"
                          @input="clearFieldError('tiers')"
                        />
                      </div>
                      <span
                        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-cb-muted"
                        >days</span
                      >
                    </div>
                  </div>

                  <!-- Revisions -->
                  <div>
                    <label
                      class="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-cb-muted"
                      >Revisions</label
                    >
                    <div class="relative">
                      <div class="bg-cb-field rounded-md">
                        <input
                          v-model.number="tier.revisions"
                          type="number"
                          min="0"
                          placeholder="1"
                          class="w-full rounded-xl border border-cb-divider bg-cb-field px-3 py-2.5 pr-16 text-sm placeholder:text-cb-muted text-cb-text outline-none transition-colors focus:border-cb-accent focus:bg-cb-base"
                          @input="clearFieldError('tiers')"
                        />
                      </div>
                      <span
                        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-cb-muted"
                        >rounds</span
                      >
                    </div>
                  </div>

                  <!-- Tier description — full width -->
                  <div class="sm:col-span-2">
                    <label
                      class="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-cb-muted"
                      >What's Included</label
                    >
                    <div class="bg-cb-field rounded-md">
                      <input
                        v-model.trim="tier.description"
                        type="text"
                        placeholder="Describe what's included in this tier…"
                        class="w-full rounded-xl border border-cb-divider bg-cb-field px-3 py-2.5 text-sm text-cb-text placeholder:text-cb-muted outline-none transition-colors focus:border-cb-accent focus:bg-cb-base"
                        @input="clearFieldError('tiers')"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add tier nudge when < 3 tiers -->
              <button
                v-if="form.tiers.length < 3"
                type="button"
                @click="addTier"
                class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-cb-divider py-3 text-xs font-semibold text-cb-muted transition-colors hover:border-cb-accent hover:bg-cb-accent-subtle hover:text-cb-accent"
              >
                <i class="fa-solid fa-plus text-[9px]"></i>
                Add Another Tier
              </button>
            </div>
          </div>
        </section>

        <!-- ② b — Charges & Commission info card ───────────────── -->
        <div class="rounded-2xl border border-cb-divider bg-cb-card divide-y divide-cb-divider">
          <div class="px-5 py-3.5 sm:px-6">
            <p class="text-[10px] font-bold uppercase tracking-widest text-cb-muted">How charges &amp; commission apply to your service</p>
          </div>
          <!-- Buyer CBC fee -->
          <div class="flex items-start gap-4 px-5 py-4 sm:px-6">
            <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cb-accent-subtle text-sm font-bold text-cb-accent">₡</span>
            <div>
              <p class="text-sm font-semibold text-cb-text">CBC Contact Fee — paid by the <span class="text-cb-accent">buyer</span></p>
              <p class="mt-1 text-xs text-cb-muted leading-relaxed">When a buyer places an order on your service, they pay a CBC contact fee upfront from their own wallet. The fee scales with your tier price and their plan. You do not pay this fee.</p>
              <div v-if="tierCbcFees.some(t => t.cbcFee > 0)" class="mt-2 flex flex-wrap gap-2">
                <span v-for="t in tierCbcFees.filter(t => t.cbcFee > 0)" :key="t.name" class="inline-flex items-center gap-1 rounded-full border border-cb-accent/20 bg-cb-accent-subtle px-2.5 py-1 text-[10px] font-bold text-cb-accent capitalize">
                  {{ t.name }}: {{ t.cbcFee }} CBC
                </span>
              </div>
            </div>
          </div>
          <!-- Commission -->
          <div class="flex items-start gap-4 px-5 py-4 sm:px-6">
            <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cb-field text-sm font-bold text-cb-muted">%</span>
            <div>
              <p class="text-sm font-semibold text-cb-text">Commission — deducted from <span class="text-cb-text">your</span> earnings</p>
              <p class="mt-1 text-xs text-cb-muted leading-relaxed">When a buyer confirms delivery, a commission is deducted from your payout based on your subscription plan. Your current rate is <strong class="text-cb-text">{{ commissionRate }}%</strong>.</p>
              <p v-if="form.tiers.length" class="mt-2 text-xs text-cb-muted">
                Example — {{ form.tiers[0]?.name || 'Starter' }} tier at ₦{{ Number(form.tiers[0]?.price || 0).toLocaleString() }}:
                you keep <strong class="text-cb-positive">₦{{ Math.round((form.tiers[0]?.price || 0) * (1 - commissionRate / 100)).toLocaleString() }}</strong> after {{ commissionRate }}% commission.
              </p>
            </div>
          </div>
          <!-- Escrow -->
          <div class="flex items-start gap-4 px-5 py-4 sm:px-6">
            <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cb-field text-sm font-bold text-cb-muted">🔒</span>
            <div>
              <p class="text-sm font-semibold text-cb-text">Escrow &amp; earnings clearance</p>
              <p class="mt-1 text-xs text-cb-muted leading-relaxed">The buyer's NGN payment is held in escrow (Paystack). Once they confirm delivery, your earnings enter <strong>Pending Clearance</strong> and are reviewed by admin before moving to your withdrawable balance. Withdrawals require a minimum of ₦500.</p>
            </div>
          </div>
        </div>

        <!-- ③ Tags & Portfolio ───────────────────────────────────── -->
        <section
          id="section-extras"
          class="scroll-mt-[72px] rounded-2xl  bg-cb-card"
        >
          <div
            class="flex items-center gap-3 rounded-t-2xl border-b border-cb-divider bg-cb-base/50 px-5 py-3.5 sm:px-6"
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cb-accent text-[10px] font-extrabold text-cb-contrast"
              >3</span
            >
            <h2 class="text-sm font-bold text-cb-text">Tags &amp; Portfolio</h2>
          </div>

          <div class="divide-y divide-cb-divider">
            <!-- Tags -->
            <div class="p-5 sm:p-6">
              <label class="mb-0.5 block text-sm font-semibold text-cb-text"
                >Tags</label
              >
              <p class="mb-3 text-xs text-cb-muted">
                Type a tag and click Add — helps clients discover your service.
              </p>

              <!-- Tag chips -->
              <div v-if="form.tags.length" class="mb-3 flex flex-wrap gap-2">
                <span
                  v-for="(tag, i) in form.tags"
                  :key="i"
                  class="inline-flex items-center gap-1 rounded-full border border-cb-accent/20 bg-cb-accent-subtle py-1 pl-2.5 pr-1.5 text-[11px] font-semibold text-cb-accent"
                >
                  #{{ tag }}
                  <button
                    type="button"
                    @click="removeTag(i); tagError = ''"
                    class="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-cb-negative hover:text-cb-contrast"
                    title="Remove tag"
                  >
                    <i class="fa-solid fa-times text-[8px]"></i>
                  </button>
                </span>
              </div>

              <div class="flex items-center min-w-0 gap-2">
                <div class="bg-cb-field rounded-md flex-1">
                  <input
                    v-model.trim="tagInput"
                    type="text"
                    maxlength="20"
                    placeholder="e.g., logo, branding, modern"
                    class="w-full rounded-xl border border-cb-divider bg-cb-field text-cb-text placeholder:text-cb-muted px-3 py-2.5 text-sm outline-none transition-colors focus:border-cb-accent focus:bg-cb-base"
                    @input="tagError = ''"
                    @keydown.enter.prevent="addTag"
                  />
                </div>
                <button
                  type="button"
                  @click="addTag"
                  :disabled="!tagInput.trim()"
                  class="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-cb-accent/30 bg-cb-accent-subtle px-3 py-2.5 text-xs font-semibold text-cb-accent transition-colors hover:bg-cb-accent/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <i class="fa-solid fa-plus text-[9px]"></i>
                  <span>Add</span>
                </button>
              </div>
              <p v-if="tagError" class="mt-1.5 flex items-center gap-1.5 text-xs text-cb-negative animate-pulse">
                <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                {{ tagError }}
              </p>
            </div>

            <!-- Portfolio URLs -->
            <div class="p-5 sm:p-6">
              <label class="mb-0.5 block text-sm font-semibold text-cb-text"
                >Portfolio Links</label
              >
              <p class="mb-3 text-xs text-cb-muted">
                Share samples of your previous work.
              </p>
              <div class="space-y-2.5">
                <div
                  v-for="(url, index) in form.portfolioUrls"
                  :key="index"
                  class="flex min-w-0 items-center gap-2"
                >
                  <div class="relative min-w-0 flex-1">
                    <i
                      class="fa-solid fa-link pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] text-cb-muted"
                    ></i>
                    <div class="bg-cb-field rounded-md">
                      <input
                        v-model.trim="form.portfolioUrls[index]"
                        type="url"
                        placeholder="https://…"
                        class="w-full min-w-0 rounded-xl border border-cb-divider tect-cb-text placeholder:text-cb-text-muted bg-cb-field py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-cb-accent focus:bg-cb-base"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="removePortfolioUrl(index)"
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-cb-muted transition-colors hover:bg-cb-negative-subtle hover:text-cb-negative"
                    title="Remove link"
                  >
                    <i class="fa-solid fa-trash text-[11px]"></i>
                  </button>
                </div>

                <button
                  type="button"
                  @click="addPortfolioUrl"
                  class="flex items-center gap-1.5 rounded-lg border border-dashed border-cb-divider px-3 py-2 text-xs font-semibold text-cb-muted transition-colors hover:border-cb-accent hover:text-cb-accent"
                >
                  <i class="fa-solid fa-plus text-[9px]"></i>
                  Add link
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ④ Listing Status (edit mode only) ───────────────────── -->
        <section
          v-if="isEditMode"
          id="section-status"
          class="scroll-mt-[72px] overflow-hidden rounded-2xl border border-cb-divider bg-cb-card"
        >
          <div
            class="flex items-center gap-3 border-b border-cb-divider bg-cb-base/50 px-5 py-3.5 sm:px-6"
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cb-accent text-[10px] font-extrabold text-cb-contrast"
              >4</span
            >
            <h2 class="text-sm font-bold text-cb-text">Listing Status</h2>
          </div>

          <div class="p-5 sm:p-6">
            <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <label
                v-for="status in statusOptions"
                :key="status.value"
                :class="[
                  'flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all',
                  form.status === status.value
                    ? 'border-cb-accent bg-cb-accent-subtle'
                    : 'border-cb-divider bg-cb-base hover:border-cb-accent/40',
                ]"
              >
                <input
                  type="radio"
                  v-model="form.status"
                  :value="status.value"
                  class="sr-only"
                />
                <span
                  :class="[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm',
                    form.status === status.value
                      ? 'bg-cb-accent text-cb-contrast'
                      : 'bg-cb-field text-cb-muted',
                  ]"
                >
                  <i :class="[status.icon]"></i>
                </span>
                <div>
                  <p
                    :class="[
                      'text-sm font-semibold',
                      form.status === status.value
                        ? 'text-cb-accent'
                        : 'text-cb-text',
                    ]"
                  >
                    {{ status.label }}
                  </p>
                  <p class="text-[10px] text-cb-muted">
                    <span v-if="status.value === 'active'"
                      >Visible in marketplace</span
                    >
                    <span v-else-if="status.value === 'paused'"
                      >Hidden from new orders</span
                    >
                    <span v-else>Saved, not published</span>
                  </p>
                </div>
              </label>
            </div>
          </div>
        </section>

        <!-- Submit error banner -->
        <div
          v-if="submitError"
          class="flex items-start gap-3 rounded-xl border border-cb-negative/30 bg-cb-negative-subtle p-4"
        >
          <i
            class="fa-solid fa-circle-exclamation mt-0.5 shrink-0 text-sm text-cb-negative"
          ></i>
          <p class="text-sm text-cb-negative">{{ submitError }}</p>
        </div>
      </form>
    </div>

    <!-- ── Sticky bottom action bar ─────────────────────────────── -->
   
    <div
      class="sticky -bottom-8 z-20 border-t border-cb-divider bg-cb-base/95 backdrop-blur-sm"
    >
      <div
        class="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
      >
        <p class="hidden text-xs text-cb-muted sm:block">
          <i
            class="fa-solid fa-shield-check mr-1 text-cb-positive opacity-60"
          ></i>
          Your progress is saved locally
        </p>
        <div class="flex w-full items-center justify-center gap-2 sm:w-auto sm:justify-end">
          <router-link
            :to="{ name: 'MyServices' }"
            class="flex items-center justify-center rounded-xl border border-cb-divider bg-cb-card px-5 py-2.5 text-sm font-semibold text-cb-text transition-colors hover:bg-cb-field"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            :disabled="!canSubmit || loading"
            @click="handleSubmit"
            class="flex items-center justify-center gap-2 rounded-xl bg-cb-accent px-6 py-2.5 text-sm font-semibold text-cb-contrast transition-all hover:bg-cb-accent-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i v-if="loading" class="fa-solid fa-spinner fa-spin text-xs"></i>
            <i
              v-else-if="isEditMode"
              class="fa-solid fa-floppy-disk text-xs"
            ></i>
            <i v-else class="fa-solid fa-rocket text-xs"></i>
            {{ isEditMode ? "Save Changes" : "Post Service" }}
          </button>
        </div>
      </div>
    </div>

    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useServiceStore } from "@/stores/serviceStore";
import { useWalletStore } from "@/stores/walletStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { useUserStore } from "@/stores/userStore";
import { useToast } from "@/composables/useToast";
import ToastContainer from "@/components/reusables/ToastContainer.vue";
import AppDropdown from "@/components/reusables/DropDownComponent.vue";
import { toPlanViewModel } from "@/utils/planViewModel";
import { getUserType } from "@/utils/planAccess";
import { getFinalCbcFee } from "@/utils/cbcFeeUtils";

const route = useRoute();
const router = useRouter();
const serviceStore = useServiceStore();
const walletStore = useWalletStore();
const subscriptionStore = useSubscriptionStore();
const userStore = useUserStore();
const { success, error, warning } = useToast();

const isEditMode = computed(() => !!route.params.id);
const serviceId = computed(() => route.params.id);
const loading = computed(() => serviceStore.actionLoading);
const submitError = ref("");

// Form state
const form = reactive({
  title: "",
  description: "",
  category: "",
  tiers: [],
  tags: [],
  portfolioUrls: [],
  status: "draft",
});

const errors = reactive({
  title: "",
  description: "",
  category: "",
  tiers: "",
});

const tagInput = ref("");
const customCategory = ref("");
const customCategoryError = ref("");
const tagError = ref("");

// Dropdown refs — used to close on selection
const categoryDropdownRef = ref(null);
const tierDropdownRefs = ref([]);

// ── Financial Logic ───────────────────────────────────────────────

const currentPlanView = computed(() => {
  const plan = subscriptionStore.subscription?.plan ||
               subscriptionStore.plans.find(p => p.tier === subscriptionStore.currentTier);
  return plan ? toPlanViewModel(plan, getUserType(userStore.user)) : null;
});

// isStudentVerified: "student" user type qualifies for reduced CBC fees (for info display)
const isStudentVerified = computed(() => getUserType(userStore.user) === "student");

// Plan's CBC discount that will apply to buyers who are on discounted plans
const cbcDiscount = computed(() => currentPlanView.value?.activeCbcDiscount ?? 0);

// Seller's commission rate — deducted from earnings when orders complete
const commissionRate = computed(() => currentPlanView.value?.activeCommission ?? 10);

// Per-tier: what buyers (standard) will pay in CBC when placing an order
// NOTE: actual buyer fee depends on THEIR plan discount, not seller's
// This is an estimate assuming a standard buyer (no plan discount)
const tierCbcFees = computed(() => {
  return form.tiers.map((t) => ({
    name: t.name,
    price: t.price || 0,
    cbcFee: getFinalCbcFee(t.price || 0, false, 0), // standard buyer, no discount
  }));
});

// Nav bar display: single value or range
const servicePostingCost = computed(() => {
  const fees = tierCbcFees.value.map((t) => t.cbcFee).filter((f) => f > 0);
  if (fees.length === 0) return "—";
  const min = Math.min(...fees);
  const max = Math.max(...fees);
  return min === max ? `${min}` : `${min} – ${max}`;
});

// ── Error Clearing Helper ──────────────────────────────────────────

const clearFieldError = (field) => {
  if (errors[field] !== undefined) {
    errors[field] = "";
  }
  if (field === 'tiers') {
    errors.tiers = "";
  }
};

// ── Validation Logic ───────────────────────────────────────────────

const canSubmit = computed(() => {
  if (!form.title.trim() || form.title.length < 5) return false;
  if (!form.description.trim() || form.description.length < 20) return false;
  if (!form.category) return false;
  if (form.category === 'other' && !customCategory.value.trim()) return false;
  if (form.tiers.length === 0) return false;
  
  for (const tier of form.tiers) {
    if (!tier.name?.trim()) return false;
    if (!tier.price || tier.price <= 0) return false;
    if (!tier.deliveryDays || tier.deliveryDays < 1) return false;
    if (!tier.description?.trim()) return false;
    if (tier.revisions === undefined || tier.revisions < 0) return false;
  }
  
  return true;
});

const validateForm = () => {
  let isValid = true;
  
  // Clear previous errors
  errors.title = "";
  errors.description = "";
  errors.category = "";
  errors.tiers = "";

  if (!form.title.trim()) {
    errors.title = "Title is required";
    isValid = false;
  } else if (form.title.length < 5) {
    errors.title = "Title must be at least 5 characters";
    isValid = false;
  } else if (form.title.length > 100) {
    errors.title = "Title must not exceed 100 characters";
    isValid = false;
  }

  if (!form.description.trim()) {
    errors.description = "Description is required";
    isValid = false;
  } else if (form.description.length < 20) {
    errors.description = "Description must be at least 20 characters";
    isValid = false;
  } else if (form.description.length > 1000) {
    errors.description = "Description must not exceed 1000 characters";
    isValid = false;
  }

if (!form.category) {
  errors.category = "Please select a category";
  isValid = false;
}

// Validate custom category when "Other" is selected
if (form.category === 'other') {
  if (!customCategory.value.trim()) {
    customCategoryError.value = "Please specify your category";
    errors.category = "Please specify your category";
    isValid = false;
  } else if (customCategory.value.trim().length < 3) {
    customCategoryError.value = "Category must be at least 3 characters";
    errors.category = "Category must be at least 3 characters";
    isValid = false;
  } else {
    customCategoryError.value = '';
  }
}
  if (form.tiers.length === 0) {
    errors.tiers = "Add at least one pricing tier";
    isValid = false;
  } else if (form.tiers.length > 3) {
    errors.tiers = "Maximum 3 tiers allowed";
    isValid = false;
  } else {
    // Check for duplicate tier names
    const tierNames = form.tiers.map(t => t.name?.trim().toLowerCase()).filter(Boolean);
    const uniqueNames = new Set(tierNames);
    if (uniqueNames.size !== tierNames.length) {
      errors.tiers = "Tier names must be unique";
      isValid = false;
    } else {
      for (const [index, tier] of form.tiers.entries()) {
        const tierLabel = tier.name || `Tier ${index + 1}`;
        
        if (!tier.name?.trim()) {
          errors.tiers = `${tierLabel}: Name is required`;
          isValid = false;
          break;
        }
        
        if (!tier.price || tier.price <= 0) {
          errors.tiers = `${tierLabel}: Price must be greater than ₦0`;
          isValid = false;
          break;
        } else if (tier.price > 10000000) {
          errors.tiers = `${tierLabel}: Price cannot exceed ₦10,000,000`;
          isValid = false;
          break;
        }
        
        if (!tier.deliveryDays || tier.deliveryDays < 1) {
          errors.tiers = `${tierLabel}: Delivery days must be at least 1`;
          isValid = false;
          break;
        } else if (tier.deliveryDays > 365) {
          errors.tiers = `${tierLabel}: Delivery days cannot exceed 365`;
          isValid = false;
          break;
        }
        
        if (!tier.description?.trim()) {
          errors.tiers = `${tierLabel}: Description is required`;
          isValid = false;
          break;
        } else if (tier.description.length > 200) {
          errors.tiers = `${tierLabel}: Description must not exceed 200 characters`;
          isValid = false;
          break;
        }
        
        if (tier.revisions === undefined || tier.revisions === null) {
          errors.tiers = `${tierLabel}: Revisions field is required`;
          isValid = false;
          break;
        } else if (tier.revisions < 0) {
          errors.tiers = `${tierLabel}: Revisions must be 0 or more`;
          isValid = false;
          break;
        } else if (tier.revisions > 20) {
          errors.tiers = `${tierLabel}: Revisions cannot exceed 20`;
          isValid = false;
          break;
        }
      }
      
      // Check for logical price progression
      if (isValid && form.tiers.length > 1) {
        const prices = form.tiers.map(t => t.price);
        for (let i = 1; i < prices.length; i++) {
          if (prices[i] <= prices[i - 1]) {
            errors.tiers = "Each tier must be priced higher than the previous one";
            isValid = false;
            break;
          }
        }
      }
      
      // Check for logical delivery progression
      if (isValid && form.tiers.length > 1) {
        const days = form.tiers.map(t => t.deliveryDays);
        for (let i = 1; i < days.length; i++) {
          if (days[i] < days[i - 1]) {
            errors.tiers = "Each tier should have equal or longer delivery time than the previous";
            isValid = false;
            break;
          }
        }
      }
    }
  }

  // Validate portfolio URLs if any are provided
  if (form.portfolioUrls.length > 0) {
    const urlRegex = /^https?:\/\/.+\..+/i;
    const invalidUrls = form.portfolioUrls.filter(url => url.trim() && !urlRegex.test(url.trim()));
    if (invalidUrls.length > 0) {
      toast.warning("Some portfolio URLs are invalid. Please check them.");
    }
  }

  return isValid;
};

// Static data
const formSteps = computed(() => [
  { id: "section-basic", label: "Basics" },
  { id: "section-pricing", label: "Pricing" },
  { id: "section-extras", label: "Extras" },
  ...(isEditMode.value ? [{ id: "section-status", label: "Status" }] : []),
]);

const categoryOptions = [
  {
    value: "graphic_design",
    label: "Graphic Design",
    icon: "fa-solid fa-pen-nib",
  },
  {
    value: "content_writing",
    label: "Content Writing",
    icon: "fa-solid fa-file-pen",
  },
  {
    value: "programming",
    label: "Programming & Dev",
    icon: "fa-solid fa-code",
  },
  { value: "web_dev", label: "Web Development", icon: "fa-solid fa-globe" },
  {
    value: "tutoring",
    label: "Tutoring & Lessons",
    icon: "fa-solid fa-chalkboard",
  },
  {
    value: "video_production",
    label: "Video Production",
    icon: "fa-solid fa-video",
  },
  {
    value: "digital_marketing",
    label: "Digital Marketing",
    icon: "fa-solid fa-bullhorn",
  },
  { value: "music_audio", label: "Music & Audio", icon: "fa-solid fa-music" },
  {
    value: "legal",
    label: "Legal Services",
    icon: "fa-solid fa-scale-balanced",
  },
  { value: "engineering", label: "Engineering", icon: "fa-solid fa-gear" },
  { value: "translation", label: "Translation", icon: "fa-solid fa-language" },
  { value: "consulting", label: "Consulting", icon: "fa-solid fa-briefcase" },
  {
    value: "data_analytics",
    label: "Data Analytics",
    icon: "fa-solid fa-chart-bar",
  },
  { value: "other", label: "Other", icon: "fa-solid fa-ellipsis" },
];

const tierNameOptions = [
  { value: "starter", label: "Starter", icon: "fa-solid fa-seedling" },
  { value: "standard", label: "Standard", icon: "fa-solid fa-layer-group" },
  { value: "premium", label: "Premium", icon: "fa-solid fa-crown" },
];

const statusOptions = [
  { value: "draft", label: "Draft", icon: "fa-solid fa-file-pen" },
  { value: "active", label: "Active", icon: "fa-solid fa-circle-check" },
  { value: "paused", label: "Paused", icon: "fa-solid fa-circle-pause" },
];

// Computed labels for dropdowns
const selectedCategoryLabel = computed(
  () =>
    categoryOptions.find((o) => o.value === form.category)?.label ??
    "Select a category",
);

// Section nav — IntersectionObserver
const activeSection = ref("section-basic");
let sectionObserver = null;

function scrollToSection(id) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

onMounted(() => {
  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) activeSection.value = e.target.id;
      });
    },
    { rootMargin: "-20% 0px -65% 0px" },
  );
  formSteps.value.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) sectionObserver.observe(el);
  });
});
onUnmounted(() => sectionObserver?.disconnect());

// Category
function selectCategory(value) {
  form.category = value;
  customCategory.value = '';
  customCategoryError.value = '';
  clearFieldError('category');
  categoryDropdownRef.value?.close?.();
}

// Tags
function addTag() {
  const value = tagInput.value.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '');
  tagError.value = "";
  
  if (!value) {
    tagError.value = "Tag cannot be empty";
    return;
  }
  
  if (value.length < 2) {
    tagError.value = "Tag must be at least 2 characters";
    return;
  }
  
  if (form.tags.includes(value)) {
    tagError.value = "Tag already added";
    return;
  }
  
  if (form.tags.length >= 15) {
    tagError.value = "Maximum 15 tags allowed";
    return;
  }
  
  form.tags.push(value);
  tagInput.value = "";
}

function removeTag(index) {
  form.tags.splice(index, 1);
  tagError.value = "";
}

// Portfolio URLs
function addPortfolioUrl() {
  if (form.portfolioUrls.length >= 10) {
    toast.warning("Maximum 10 portfolio links allowed");
    return;
  }
  form.portfolioUrls.push("");
}

function removePortfolioUrl(index) {
  form.portfolioUrls.splice(index, 1);
}

// Tiers
function addTier() {
  if (form.tiers.length >= 3) {
    toast.warning("Maximum 3 tiers allowed");
    return;
  }
  
  // Auto-name new tier based on existing ones
  const existingNames = form.tiers.map(t => t.name?.toLowerCase());
  let newName = "starter";
  if (!existingNames.includes("starter")) newName = "starter";
  else if (!existingNames.includes("standard")) newName = "standard";
  else if (!existingNames.includes("premium")) newName = "premium";
  else newName = "starter"; // fallback
  
  
  form.tiers.push({
    name: newName,
    price: form.tiers.length > 0 ? form.tiers[form.tiers.length - 1].price + 3000 : 2000,
    deliveryDays: 3,
    description: "",
    revisions: 1,
  });
  
  clearFieldError('tiers');
}

function removeTier(index) {
  if (form.tiers.length <= 1) {
    toast.warning("You must have at least one tier");
    return;
  }
  form.tiers.splice(index, 1);
  clearFieldError('tiers');
}

if (!isEditMode.value) addTier();

// Load service (edit mode)
async function loadService() {
  if (!isEditMode.value) return;
  try {
    await serviceStore.fetchService(serviceId.value);
    const service = serviceStore.currentService;
    if (service) {
      form.title = service.title || "";
      form.description = service.description || "";
      form.category = service.category || "";
      form.tiers = service.tiers ? [...service.tiers] : [];
      form.tags = service.tags ? [...service.tags] : [];
      form.portfolioUrls = service.portfolioUrls
        ? [...service.portfolioUrls]
        : [];
      form.status = service.status || "draft";
      if (form.tiers.length === 0) addTier();
    }
  } catch {
    error("Failed to load service data");
    router.push({ name: "MyServices" });
  }
}

onMounted(async () => {
  await Promise.all([
    walletStore.fetchBalance(),
    subscriptionStore.initialize()
  ]);
  await loadService();
});

// Submit
async function handleSubmit() {
  submitError.value = "";
  
  if (!validateForm()) {
    // Scroll to first error
    const firstErrorSection = errors.title || errors.description || errors.category
      ? "section-basic"
      : errors.tiers
        ? "section-pricing"
        : null;
    
    if (firstErrorSection) {
      scrollToSection(firstErrorSection);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }

  try {
  const payload = { ...form };
  
  // Handle custom category
  if (form.category === 'other') {
    payload.customCategory = customCategory.value.trim();
  }
  
  // Filter out empty portfolio URLs
  payload.portfolioUrls = payload.portfolioUrls.filter(
    (url) => url.trim() !== "",
  );
  
  // Sanitize tags (remove special characters)
  payload.tags = payload.tags.map(tag => tag.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim());
    
    // Validate tier name uniqueness before submission
    const tierNames = payload.tiers.map(t => t.name?.trim().toLowerCase());
    if (new Set(tierNames).size !== tierNames.length) {
      errors.tiers = "Tier names must be unique";
      scrollToSection("section-pricing");
      return;
    }

    if (isEditMode.value) {
      await serviceStore.updateService(serviceId.value, payload);
      success("Service updated successfully");
    } else {
      await serviceStore.createService(payload);
      success("Service created successfully");
    }

    router.push({ name: "MyServices" });
  } catch (err) {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      serviceStore.error ||
      "Failed to save service. Please check your inputs and try again.";
    
    submitError.value = errorMessage;
    error(errorMessage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
import { HABIT_COPY } from './habitConstants';
import { HabitCreateFormSection } from './HabitCreateFormSection';
import { HabitDashboardHeader } from './HabitDashboardHeader';
import { HabitFilters } from './HabitFilters';
import { HabitList } from './HabitList';
import { HabitStatsBar } from './HabitStatsBar';
import { useHabitDashboard } from './useHabitDashboard';

export function HabitDashboard(): JSX.Element {
  const dashboard = useHabitDashboard();

  return (
    <section className="grid gap-5" aria-label={HABIT_COPY.dashboardAriaLabel}>
      <HabitDashboardHeader onCreate={dashboard.startCreate} />
      <HabitStatsBar stats={dashboard.stats} />

      <HabitFilters
        completedToday={dashboard.filterState.completedToday}
        hasActiveFilters={dashboard.filterState.hasActiveFilters}
        search={dashboard.filterState.search}
        status={dashboard.filterState.status}
        todayFilterDisabled={dashboard.filterState.todayFilterDisabled}
        onClear={dashboard.filterState.clearFilters}
        onCompletedTodayChange={dashboard.filterState.setCompletedToday}
        onSearchChange={dashboard.filterState.setSearch}
        onStatusChange={dashboard.filterState.changeStatus}
      />

      <HabitCreateFormSection
        formError={dashboard.formError}
        formState={dashboard.formState}
        isSaving={dashboard.isMutating}
        onCancel={dashboard.cancelForm}
        onSubmit={dashboard.submitHabit}
      />

      <HabitList
        archivingHabitId={dashboard.archivingHabitId}
        deletingHabitId={dashboard.deletingHabitId}
        errorMessage={dashboard.listError}
        hasActiveFilters={dashboard.filterState.hasActiveFilters}
        habits={dashboard.habits}
        isLoading={dashboard.isLoading}
        isMutating={dashboard.isMutating}
        editingHabit={dashboard.formState?.mode === 'edit' ? dashboard.formState.habit : null}
        editErrorMessage={dashboard.formState?.mode === 'edit' ? dashboard.formError : null}
        onCancelEdit={dashboard.cancelForm}
        onCancelArchive={() => dashboard.setArchivingHabitId(null)}
        onDelete={dashboard.confirmDelete}
        onEdit={dashboard.startEdit}
        onCancelDelete={() => dashboard.setDeletingHabitId(null)}
        onCheckIn={dashboard.completeToday}
        onRequestArchive={dashboard.requestArchive}
        onRequestDelete={dashboard.requestDelete}
        onSubmitEdit={dashboard.submitHabit}
        onStatusChange={dashboard.changeHabitStatus}
        onUndoCheckIn={dashboard.undoToday}
      />
    </section>
  );
}

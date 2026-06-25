import DrainEventForm from './DrainEventForm'
import FertilizationEventForm from './FertilizationEventForm'
import FloweringEventForm from './FloweringEventForm'
import GenericEventForm from './GenericEventForm'
import { getEventFormKind } from './eventFormUtils'

function EventFormRenderer({ eventType, values, onChange }) {
  const formKind = getEventFormKind(eventType)

  if (formKind === 'flowering') {
    return <FloweringEventForm values={values} onChange={onChange} />
  }

  if (formKind === 'fertilization') {
    return <FertilizationEventForm values={values} onChange={onChange} />
  }

  if (formKind === 'drain') {
    return <DrainEventForm values={values} onChange={onChange} />
  }

  return <GenericEventForm values={values} onChange={onChange} />
}

export default EventFormRenderer

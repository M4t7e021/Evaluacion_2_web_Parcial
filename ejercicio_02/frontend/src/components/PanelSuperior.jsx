import { Navbar, NavbarBrand, Alert, Badge } from 'reactstrap';

// Panel fijo: muestra el saldo del usuario y el total de la reserva.
function PanelSuperior({ saldo, total }) {
  return (
    <Navbar color="dark" dark fixed="top" className="px-3">
      <NavbarBrand>🍽️ Food DEI</NavbarBrand>
      <div className="d-flex align-items-center gap-3">
        <Alert color="info" className="mb-0 py-1 px-3">
          Tu saldo actual: <strong>${saldo.toFixed(2)}</strong>
        </Alert>
        <span className="text-white">
          Total de tu Reserva:{' '}
          <Badge color="light" className="text-dark" pill>
            ${total.toFixed(2)}
          </Badge>
        </span>
      </div>
    </Navbar>
  );
}

export default PanelSuperior;

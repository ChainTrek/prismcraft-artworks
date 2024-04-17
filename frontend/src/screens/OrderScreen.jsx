import React from 'react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Row, Col, ListGroup, Image, Form, Card, Button } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { useGetOrderDetailsQuery, usePayOrderMutation, useGetPayPalClientIdQuery } from '../slices/ordersApiSlice'

const OrderScreen = () => {
	const { id: orderId } = useParams()

	const { data: order, refetch, error, isLoading } = useGetOrderDetailsQuery(orderId)

	const [payOrder, { isLoading: isPaying }] = usePayOrderMutation()

	const [{ isPending }, paypalDispatch] = usePayPalScriptReducer()

	const { data: paypal, isLoading: loadingPayPal, error: paypalError } = useGetPayPalClientIdQuery()

	const { userInfo } = useSelector(state => state.auth)

	useEffect(() => {
		if (!paypalError && !loadingPayPal && paypal.clientId) {
			const loadPayPalScript = async () => {
				paypalDispatch({
					type: 'resetOptions',
					value: { 'client-id': paypal.clientId },
					currency: 'USD',
				 })
				 paypalDispatch({
					type: 'setLoadingStatus',
					value: 'pending',
				 })
			}

			if (order && !order.isPaid) {
				if (!window.paypal) {
					loadPayPalScript()
				}
			}
		}
	}, [order, paypal, paypalError, loadingPayPal, paypalDispatch])

	return isLoading ? (
		<Loader />
	) : error ? (
		<Message variant='danger'>{error}</Message>
	) : (
		<>
			<h1>Order {order._id}</h1>
			<Row>
				<Col md={8}>
					<ListGroup variant='flush'>
						<ListGroup.Item>
							<h2>Shipping</h2>
							<Row className='my-2'>
								<Col md={2}>
									<strong>Name:</strong>
								</Col>
								<Col md={6}>{order.user.name}</Col>
							</Row>
							<Row className='my-2'>
								<Col md={2}>
									<strong>Email:</strong>
								</Col>
								<Col md={6}>{order.user.email}</Col>
							</Row>
							<Row className='my-2'>
								<Col md={2}>
									<strong>Address:</strong>
								</Col>
								<Col md={6}>
									{order.shippingAddress.address} <br />
									{order.shippingAddress.city}, {order.shippingAddress.state}{' '}
									{order.shippingAddress.postalCode}
								</Col>
							</Row>
							{order.isDelivered ? (
								<Message variant='success'>Delivered on {order.deliveredAt}</Message>
							) : (
								<Message variant='danger'>Not Delivered</Message>
							)}
						</ListGroup.Item>

						<ListGroup.Item>
							<h2>Payment Method</h2>
							<Row className='my-2'>
								<Col md={2}>
									<strong>Method:</strong>
								</Col>
								<Col md={6}>{order.paymentMethod}</Col>
							</Row>
							{order.isPaid ? (
								<Message variant='success'>Paid on {order.paidAt}</Message>
							) : (
								<Message variant='danger'>Not Paid</Message>
							)}
						</ListGroup.Item>

						<ListGroup.Item>
							<h2>Order Items</h2>
							{order.orderItems.length === 0 ? (
								<Message>Your order is empty</Message>
							) : (
								<ListGroup variant='flush'>
									{order.orderItems.map((item, index) => (
										<ListGroup.Item key={index}>
											<Row>
												<Col md={2}>
													<Image
														src={item.imagePath}
														alt={item.name}
														fluid
														rounded
													/>
												</Col>
												<Col>
													<Link to={`/product/${item.product}`}>
														{item.name}
													</Link>
												</Col>
												<Col md={4}>
													{item.qty} x ${item.price} = $
													{(item.qty * item.price).toFixed(2)}
												</Col>
											</Row>
										</ListGroup.Item>
									))}
								</ListGroup>
							)}
						</ListGroup.Item>
					</ListGroup>
				</Col>
				<Col md={4}>
					<Card>
						<ListGroup variant='flush'>
							<ListGroup.Item>
								<h2>Order Summary</h2>
							</ListGroup.Item>

							<ListGroup.Item>
								<Row>
									<Col>Items</Col>
									<Col>${order.itemsPrice.toFixed(2)}</Col>
								</Row>
								<Row>
									<Col>Shipping</Col>
									<Col>${order.shippingPrice.toFixed(2)}</Col>
								</Row>
								<Row>
									<Col>Tax</Col>
									<Col>${order.taxPrice.toFixed(2)}</Col>
								</Row>
								<Row>
									<Col>Total</Col>
									<Col>${order.totalPrice.toFixed(2)}</Col>
								</Row>
							</ListGroup.Item>
							{/* PAY ORDER PLACEHOLDER */}
							{/* MARK AS DELIVERED PLACEHOLDER */}
						</ListGroup>
					</Card>
				</Col>
			</Row>
		</>
	)
}

export default OrderScreen

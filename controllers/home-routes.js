const sequelize = require('../config/connection');
const { Deck, User, Card } = require('../models'); //tbd when we get models set up
const withAuth = require('../utils/auth');
const router = require('express').Router();
//the get request for the main page
router.get('/', withAuth, async (req, res) => {
	try {
		const deckQuery = await Deck.findAll({
			// where:{
			// 	user_id: req.session.user_id
			// },
			attributes: [
				'id',
				'name',
				'user_id'
			],
			include: [{
				model: Card,
				attributes: ['id', 'question', 'answer', 'deck_id']
			}],
			include: [{
				model:User,
				attributes:['username']
			}]
		})

		const decks = deckQuery.map((displayDecks) =>
			displayDecks.get({ plain: true })
		);
		req.session.save(() => {
			// We set up a session variable to count the number of times we visit the homepage
			if (req.session.countVisit) {
			  // If the 'countVisit' session variable already exists, increment it by 1
			  req.session.countVisit++;
			} else {
			  // If the 'countVisit' session variable doesn't exist, set it to 1
			  req.session.countVisit = 1;
			}
		
		
		res.render('homepage', { decks, loggedIn: req.session.loggedIn, countVisit: req.session.countVisit}) //renders the homepage for now
	});
}

	catch (err) {
		console.log(err);
		res.status(500).json(err);
	};
});


// login route
router.get('/login', (req, res) => {
	// If the user is already logged in, redirect to the homepage
	// if (req.session.loggedIn) {
	// 	res.redirect('/');
	// 	return;
	// }
	// Otherwise, render the 'login' template
	res.render('login');
});


router.get('/deck/:id', async (req, res) => { //Shows the contents of each deck by ID
	try{
		const deckbyID = await Deck.findOne({
			where:{
					id: req.params.id
			},
			attributes:[
					'id',
					'name',
					'user_id'
				],
			include: [{
					model: Card,
					attributes: ['id', 'question', 'answer', 'deck_id']
				}]
			})
				console.log(req.params['id'])
				
			const singleDeck = await deckbyID
            if (!singleDeck) {
                res.status(404).json({ message: 'No deck found with this id' });
                return;
            }

			

            const deckCards = singleDeck.get({ plain: true });
            console.log(deckCards);
            res.render('deckofCards', { deckCards, loggedIn: true }); //This is similar to how the homepage works, except if we click on a post it instead renders the individual post!

		
        }
        catch(err) {
            console.log(err);
            res.status(500).json(err);
        };
});


router.get('/deck/:deck_id/card/:card_id', async (req, res) => { //Shows the answer of the associated card id
	try{
		const cardbyID = await Card.findOne({
			where:{
					id: req.params.card_id
			},
			attributes:[
					'id',
					'question',
					'answer',
					'deck_id'
			],
			include: [{
					model: Deck,
					attributes: ['id', 'name']
				}]
			})
			
			const singleCard = await cardbyID
            if (!singleCard) {
                res.status(404).json({ message: 'No deck found with this id' });
                return;
            }

            const cardAnswer = singleCard.get({ plain: true });
            console.log(cardAnswer);
            res.render('cardAnswer', { cardAnswer, loggedIn: true }); //This is similar to how the homepage works, except if we click on a post it instead renders the individual post!


        }
        catch(err) {
            console.log(err);
            res.status(500).json(err);
        };
});


router.get('/my-decks', withAuth, async (req, res) => {
	try {
		const deckQuery = await Deck.findAll({
			where:{
				user_id: req.session.user_id
			},
			attributes: [
				'id',
				'name',
				'user_id'
			],
			include: [{
				model: Card,
				attributes: ['id', 'question', 'answer', 'deck_id']
			}],
			include: [{
				model:User,
				attributes:['username']
			}]
		})

		const myDecks = deckQuery.map((displayDecks) =>
			displayDecks.get({ plain: true })
		)
		console.log(myDecks)
		res.render('my-decks', { myDecks, loggedIn: req.session.loggedIn }) //renders the homepage for now
	}

	catch (err) {
		console.log(err);
		res.status(500).json(err);
	};
});



router.get('/new-deck', (req, res) => {
    res.render('new-deck', {loggedIn: true}); //keeps you logged in
});

router.get('/deck/:id/new-card', (req, res) => {
    res.render('new-card', {loggedIn: true}); //keeps you logged in
});


module.exports = router;
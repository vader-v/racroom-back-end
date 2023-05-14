import { Profile } from "../models/profile.js"
import { Trivia } from "../models/trivia.js"

const create = async (req, res) => {
    try {
        req.body.owner = req.user.profile
        req.body.questions = [{
            "text": req.body.question,
            "choices": [{
                "text": req.body.answer1,
                "answer": req.body.checkbox1
            },{
                "text": req.body.answer2,
                "answer": req.body.checkbox2
            },{
                "text": req.body.answer3,
                "answer": req.body.checkbox3
            },{
                "text": req.body.answer4,
                "answer": req.body.checkbox4
            }]
        }]
        console.log("req.body ==> ",req.body)
        const trivia = await Trivia.create(req.body)
        const profile = await Profile.findByIdAndUpdate(
        req.user.profile,
        { $push: { trivia: trivia } },
        { new: true }
        )
        trivia.owner = profile
        res.status(201).json(trivia)
        console.log("TRIVIA", trivia)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

const index = async (req, res) => {
    try {
        const trivia = await Trivia.find({})
            .populate("owner")
            .sort({ createdAt: 'desc' })
        res.status(200).json(trivia)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

const show = async (req, res) => {
    try {
        const { triviaId } = req.params
        const trivia = await Trivia.findById(triviaId)
            .populate("owner")
        res.status(200).json(trivia)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

async function deleteTrivia(req, res) {
  try {
    const trivia = await Trivia.findByIdAndDelete(req.params.triviaId)
    // req.user.profile is being used through middleware, decodeUserFromToken route
    const profile = await Profile.findById(req.user.profile)
    // req.params.triviaId can also be trivia._id from line 69. Its actually better to do trivia._id
    profile.trivia.remove({_id: req.params.triviaId})
    await profile.save()
    // we are returning the trivia that was deleted for filtering purposes in the front end. To filter the deleted on from the rest.
    res.json(trivia)
    console.log("TRIVIA DELETED",trivia)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

export {
    create,
    index,
    show,
    deleteTrivia as delete,
}

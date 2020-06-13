import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
}));

function getSteps() {
  return ['Select Snippet Position', 'Customise The Snippet', 'Setup Your Bundles', 'Support'];
}

function getStepContent(step) {
  switch (step) {
    case 0:
      return `To start showing the bundle snippet to your customers you need to place one line of code 
              in your Product Template/Section wherever you want the snippet to appear: {% render 'shoplee-bundles' %}
              If you need any sort of helping placing it, please don't hesitate to contact us 
              through our support Chat OR mail us at neilshankarnath@gmail.com.`;
    case 1:
      return `Now that you have setup the position of the snippet, its time to customize the Snippet! 
              Head on to the bundle configuration panel from the left navigation bar, 
              There, you may now start customizing the title, color etc.`;
    case 2:
      return `If you are done with customizing your snippet, now you can even start to change bundle sets, 
              apply discount to each of them, check if there are new recommendations and more!`;
    case 3:
      return `If you need any sort of help, you can contact us through the chat or email us at neilshankarnath@gmail.com`
    default:
      return 'Unknown step';
  }
}

export default function SetupStepper() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();
  const [displayStep, setDisplayStep] = React.useState(true)

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  React.useEffect(() => {
    if (localStorage.getItem("activeStep") !== null) {
      if (localStorage.getItem("activeStep") >= 4) {
        setDisplayStep(true)
      }
      setActiveStep(localStorage.getItem("activeStep"))
    } else {
      setDisplayStep(false)
    }
  }, [])

  React.useEffect(() => {
    if (activeStep === steps.length) {
      localStorage.setItem("activeStep", 4)
    }
  }, [activeStep])

  return (
    <div className={classes.root}>
      <div style={{ display: ((displayStep === true) ? 'none' : 'block') }}>
      <Typography variant="h4">Setup Guide</Typography>
      <Typography>Follow our setup guide to get help with setting up the app.</Typography><br />
      <Paper elevation={10}>
      <Stepper style={{"borderRadius":"25px","borderBottomRightRadius":"0","borderBottomLeftRadius":"0"}} activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              <Typography>{getStepContent(index)}</Typography>
              <div className={classes.actionsContainer}>
                <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className={classes.button}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={classes.button}
                  >
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      </Paper>
      {activeStep === steps.length && (
        <Paper square elevation={10} className={classes.resetContainer}>
          <Typography>All steps completed - you&apos;re finished & Ready To Start Making More Sales!</Typography>
        </Paper>
      )}
      </div>
    </div>
  );
}

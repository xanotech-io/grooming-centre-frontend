import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Box,
    IconButton,
    Typography,
    makeStyles,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { Select, TimePicker, Button } from '../../../../components';

const useStyles = makeStyles((theme) => ({
    dialogPaper: {
        borderRadius: 16,
        padding: theme.spacing(2),
        maxWidth: 500,
    },
    dialogTitle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: theme.spacing(2),
    },
    closeButton: {
        padding: 0,
    },
    dialogContent: {
        paddingTop: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(3),
    },
    dialogActions: {
        paddingTop: theme.spacing(4),
        display: 'flex',
        gap: theme.spacing(2),
        justifyContent: 'space-between',
    },
    saveButton: {
        backgroundColor: '#6A0DAD', // Purple provided in image context or approximate
        color: '#fff',
        '&:hover': {
            backgroundColor: '#580B90',
        },
    },
    cancelButton: {
        color: '#D32F2F',
        borderColor: '#D32F2F',
    }
}));

const ScheduleReportModal = ({ open, onClose }) => {
    const classes = useStyles();
    const [frequency, setFrequency] = useState('');
    const [frequencyDay, setFrequencyDay] = useState('');
    const [time, setTime] = useState(new Date().setHours(10, 0, 0, 0)); // Default 10:00 AM
    const [deliveryMethod, setDeliveryMethod] = useState('Dashboard');

    const handleSave = () => {
        // Logic to save schedule
        console.log({ frequency, frequencyDay, time, deliveryMethod });
        onClose();
    };

    const frequencyOptions = [
        { label: 'Weekly', value: 'weekly' },
        { label: 'Daily', value: 'daily' },
        { label: 'Monthly', value: 'monthly' },
    ];

    const dayOptions = [
        { label: 'Every Monday', value: 'monday' },
        { label: 'Every Tuesday', value: 'tuesday' },
        { label: 'Every Wednesday', value: 'wednesday' },
        { label: 'Every Thursday', value: 'thursday' },
        { label: 'Every Friday', value: 'friday' },
        { label: 'Every Saturday', value: 'saturday' },
        { label: 'Every Sunday', value: 'sunday' },
    ];

    const deliveryOptions = [
        { label: 'Dashboard', value: 'Dashboard' },
        { label: 'Email', value: 'Email' },
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose} // Add onClose here for backdrop click close
            classes={{ paper: classes.dialogPaper }}
            fullWidth
            maxWidth="sm"
        >
            <Box className={classes.dialogTitle}>
                <Typography variant="h6" style={{ fontWeight: 'bold' }}>Schedule Report</Typography>
                <IconButton onClick={onClose} className={classes.closeButton}>
                    <Close />
                </IconButton>
            </Box>

            <DialogContent className={classes.dialogContent} style={{ overflowY: 'visible' }}>
                <Select
                    label="Schedule Frequency"
                    placeholder="Select schedule frequency"
                    options={frequencyOptions}
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                />

                <Select
                    label="Frequency Day"
                    placeholder="Select day"
                    options={dayOptions}
                    value={frequencyDay}
                    onChange={(e) => setFrequencyDay(e.target.value)}
                />

                <TimePicker
                    label="Time"
                    value={time}
                    onChange={setTime}
                />

                <Select
                    label="Delivery Method"
                    placeholder="Select delivery method"
                    options={deliveryOptions}
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                />
            </DialogContent>

            <DialogActions className={classes.dialogActions}>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    style={{
                        color: '#D32F2F',
                        borderColor: '#D32F2F',
                        width: '100%',
                        backgroundColor: "#ffffff"
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    style={{
                        backgroundColor: '#660066', // Approx purple
                        color: 'white',
                        width: '100%'
                    }}
                >
                    Save schedule
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ScheduleReportModal;

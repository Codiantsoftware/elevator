document.addEventListener('DOMContentLoaded', () => {
    const elevators = document.querySelectorAll('.elevator');
    const floors = document.querySelectorAll('.floor');
    let queue = [];
    let busyElevators = new Set();
    const arrivalSound = document.getElementById('arrival-sound');

    // Add click event listeners to call buttons on each floor
    floors.forEach(floor => {
        const button = floor.querySelector('.call-button');
        button.addEventListener('click', () => {
            if (!button.classList.contains('waiting')) {
                button.classList.add('waiting');
                button.textContent = 'Waiting';
                handleCall(floor.dataset.floor);
            }
        });
    });

    // Function to handle the call request for a floor
    function handleCall(floor) {
        const availableElevator = findClosestElevator(floor);
        if (availableElevator) {
            const estimatedTime = calculateEstimatedTime(availableElevator, floor);
            displayEstimatedTime(floor, estimatedTime, availableElevator);
            moveElevator(availableElevator, floor);
        } else {
            queue.push(floor);
        }
    }

    // Function to find the closest available elevator to a given floor
    function findClosestElevator(floor) {
        let closest = null;
        let minDistance = Infinity;
        elevators.forEach(elevator => {
            if (!busyElevators.has(elevator)) {
                const distance = Math.abs(elevator.dataset.floor - floor);
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = elevator;
                }
            }
        });
        if (closest) {
            closest.classList.add('findElevator');
        }
        return closest;
    }

    // Function to calculate the estimated time for an elevator to reach a given floor
    function calculateEstimatedTime(elevator, floor) {
        const initialFloor = elevator.dataset.floor;
        const duration = Math.abs(initialFloor - floor) * 2; // 2 seconds per floor
        return duration;
    }

    // Function to display the estimated time for the elevator to reach the floor
    function displayEstimatedTime(floor, estimatedTime, availableElevator) {
        const position = availableElevator.getAttribute("data-elevator");
        const estimatedTimeElement = document.querySelector(`.estimated-time[data-estimated-time="${position}"]`);
        estimatedTimeElement.textContent = `${estimatedTime} sec`;
        estimatedTimeElement.style.top = `${(9 - floor) * 10}%`;
        estimatedTimeElement.style.display = "block";
        availableElevator.parentNode.appendChild(estimatedTimeElement);
    }

    // Function to move the elevator to the requested floor
    function moveElevator(elevator, floor) {
        busyElevators.add(elevator);
        elevator.classList.add('moving');
        const startTime = new Date(); // Start time

        const duration = calculateEstimatedTime(elevator, floor);
        setTimeout(() => {
            elevator.style.top = `${(9 - floor) * 10}%`; // Assuming 10% per floor height
            elevator.dataset.floor = floor;

            // Update the button text and color on the selected floor
            const floorElement = document.querySelector(`.floor[data-floor="${floor}"]`);
            const button = floorElement.querySelector('.call-button');

            // Remove the estimated time display
            const estimatedTimeElement = elevator.parentNode.querySelector('.estimated-time');
            if (estimatedTimeElement) {
                // estimatedTimeElement.hide();
                estimatedTimeElement.style.display = "none";
            }
            // Play the arrival sound
            if (arrivalSound) {
                arrivalSound.play();
            }
            // After 2 seconds, revert button to initial state
            setTimeout(() => {
                elevator.classList.remove('moving');
                elevator.classList.remove('findElevator');
                elevator.classList.add('arrived');
                button.textContent = 'Arrived';
                button.classList.remove('waiting');
                button.classList.add('arrived');
                setTimeout(() => {
                    button.textContent = 'Call';
                    button.classList.remove('arrived');
                    elevator.classList.remove('arrived');
                    busyElevators.delete(elevator);
                    processQueue();
                }, 1000);

            }, 2000); // 2000 ms = 2 seconds

        }, duration * 1000);
    }

    // Function to process the next request in the queue
    function processQueue() {
        if (queue.length > 0) {
            const nextFloor = queue.shift();
            handleCall(nextFloor);
        }
    }
});
